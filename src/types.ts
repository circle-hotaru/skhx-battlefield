export type TradeSide = 'buy' | 'sell';
export type ConnectionStatus = 'connecting' | 'live' | 'reconnecting';

export interface OrderbookLevel {
  price: number;
  quantity: number;
  orderCount: number;
}

export interface MarketTrade {
  id: string | number;
  side: TradeSide;
  price: number;
  quantity: number;
  notional: number;
  whale: boolean;
  airstrike: boolean;
  time: Date;
}

export interface MarketSnapshot {
  symbol: string;
  time: number;
  price: number;
  previousClose: number;
  markPrice: number;
  oraclePrice: number;
  funding: number;
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  bidTotal: number;
  askTotal: number;
  bidNotional: number;
  askNotional: number;
  imbalance: number;
  whaleRatio: number;
  trade: MarketTrade | null;
}
