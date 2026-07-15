import { AIRSTRIKE_NOTIONAL, MARKET, WHALE_NOTIONAL } from '../config';
import type { ConnectionStatus, MarketSnapshot, MarketTrade, OrderbookLevel } from '../types';

interface RawLevel {
  px: string;
  sz: string;
  n?: number;
}

interface RawBook {
  coin: string;
  time: number;
  levels: [RawLevel[], RawLevel[]];
}

interface RawTrade {
  coin: string;
  side: 'A' | 'B';
  px: string;
  sz: string;
  tid?: number;
  time: number;
  hash: string;
}

interface AssetContext {
  midPx?: string;
  prevDayPx?: string;
  markPx?: string;
  oraclePx?: string;
  funding?: string;
  [key: string]: unknown;
}

type SnapshotHandler = (snapshot: MarketSnapshot) => void;
type StatusHandler = (status: ConnectionStatus) => void;

export class HyperliquidOrderbookAdapter {
  private socket: WebSocket | null = null;
  private book: RawBook | null = null;
  private context: AssetContext = {};
  private pendingTrade: MarketTrade | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private emitTimer: ReturnType<typeof setTimeout> | null = null;
  private stopped = false;
  private onSnapshot?: SnapshotHandler;
  private onStatus?: StatusHandler;

  connect(onSnapshot: SnapshotHandler, onStatus: StatusHandler) {
    this.onSnapshot = onSnapshot;
    this.onStatus = onStatus;
    this.stopped = false;
    this.open();
    void this.hydrateContext();
  }

  private async hydrateContext() {
    try {
      const response = await fetch(MARKET.infoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'metaAndAssetCtxs', dex: MARKET.dex })
      });
      if (!response.ok) return;
      const [meta, contexts] = await response.json() as [
        { universe: Array<{ name: string }> },
        AssetContext[]
      ];
      const index = meta.universe.findIndex((asset) => asset.name === MARKET.coin);
      if (index >= 0) {
        this.context = { ...this.context, ...contexts[index] };
        this.scheduleEmit();
      }
    } catch {
      // The websocket still provides the live book if the context request is unavailable.
    }
  }

  private open() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.onStatus?.(this.reconnectAttempt ? 'reconnecting' : 'connecting');
    const socket = new WebSocket(MARKET.websocketUrl);
    this.socket = socket;

    socket.onopen = () => {
      if (this.socket !== socket) return;
      this.reconnectAttempt = 0;
      this.onStatus?.('live');
      ['l2Book', 'trades', 'activeAssetCtx'].forEach((type) => {
        socket.send(JSON.stringify({ method: 'subscribe', subscription: { type, coin: MARKET.coin } }));
      });
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ method: 'ping' }));
      }, 30_000);
    };
    socket.onmessage = (event) => this.handleMessage(JSON.parse(String(event.data)) as Record<string, unknown>);
    socket.onerror = () => this.onStatus?.('reconnecting');
    socket.onclose = () => {
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
      if (this.stopped || this.socket !== socket) return;
      this.onStatus?.('reconnecting');
      const delay = Math.min(10_000, 800 * 2 ** this.reconnectAttempt);
      this.reconnectAttempt += 1;
      this.reconnectTimer = setTimeout(() => this.open(), delay);
    };
  }

  private handleMessage(message: Record<string, unknown>) {
    if (message.channel === 'l2Book') {
      const book = message.data as RawBook | undefined;
      if (book?.coin === MARKET.coin) {
        this.book = book;
        this.scheduleEmit();
      }
      return;
    }

    if (message.channel === 'trades' && Array.isArray(message.data)) {
      const trades = message.data as RawTrade[];
      const trade = [...trades].reverse().find((row) => row.coin === MARKET.coin);
      if (trade) {
        const price = Number(trade.px);
        const quantity = Number(trade.sz);
        this.pendingTrade = {
          id: trade.tid ?? `${trade.time}-${trade.hash}-${trade.px}-${trade.sz}`,
          side: trade.side === 'B' ? 'buy' : 'sell',
          price,
          quantity,
          notional: price * quantity,
          whale: price * quantity >= WHALE_NOTIONAL,
          airstrike: price * quantity >= AIRSTRIKE_NOTIONAL,
          time: new Date(trade.time)
        };
        this.scheduleEmit(true);
      }
      return;
    }

    if (message.channel === 'activeAssetCtx') {
      const data = message.data as ({ coin?: string; ctx?: AssetContext } & AssetContext) | undefined;
      if (data?.coin === MARKET.coin) {
        this.context = { ...this.context, ...(data.ctx ?? data) };
        this.scheduleEmit();
      }
    }
  }

  private scheduleEmit(immediate = false) {
    if (!this.book || this.emitTimer) return;
    this.emitTimer = setTimeout(() => {
      this.emitTimer = null;
      this.emitSnapshot();
    }, immediate ? 0 : 100);
  }

  private emitSnapshot() {
    if (!this.book) return;
    const normalizeLevel = (level: RawLevel): OrderbookLevel => ({
      price: Number(level.px),
      quantity: Number(level.sz),
      orderCount: Number(level.n ?? 1)
    });
    const bids = this.book.levels[0].slice(0, 10).map(normalizeLevel);
    const asks = this.book.levels[1].slice(0, 10).map(normalizeLevel);
    if (!bids.length || !asks.length) return;

    const bidTotal = bids.reduce((sum, row) => sum + row.quantity, 0);
    const askTotal = asks.reduce((sum, row) => sum + row.quantity, 0);
    const bidNotional = bids.reduce((sum, row) => sum + row.price * row.quantity, 0);
    const askNotional = asks.reduce((sum, row) => sum + row.price * row.quantity, 0);
    const totalNotional = bidNotional + askNotional;
    const largeLevelNotional = [...bids, ...asks]
      .filter((row) => row.price * row.quantity >= WHALE_NOTIONAL)
      .reduce((sum, row) => sum + row.price * row.quantity, 0);
    const price = this.pendingTrade?.price ?? (Number(this.context.midPx) || (bids[0].price + asks[0].price) / 2);
    const previousClose = Number(this.context.prevDayPx) || price;
    const trade = this.pendingTrade;
    this.pendingTrade = null;

    this.onSnapshot?.({
      symbol: MARKET.coin,
      time: this.book.time,
      price,
      previousClose,
      markPrice: Number(this.context.markPx) || price,
      oraclePrice: Number(this.context.oraclePx) || price,
      funding: Number(this.context.funding) || 0,
      bids,
      asks,
      bidTotal,
      askTotal,
      bidNotional,
      askNotional,
      imbalance: totalNotional ? (bidNotional - askNotional) / totalNotional : 0,
      whaleRatio: totalNotional ? largeLevelNotional / totalNotional : 0,
      trade
    });
  }

  reconnect() {
    this.socket?.close();
  }

  disconnect() {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.emitTimer) clearTimeout(this.emitTimer);
    this.socket?.close();
    this.socket = null;
  }
}
