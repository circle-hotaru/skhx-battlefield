import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { trackEvent } from './analytics';
import './style.css';

const MARKET = {
  coin: 'xyz:SKHX',
  dex: 'xyz',
  name: 'SK hynix Perpetual',
  tick: .1,
  websocketUrl: 'wss://api.hyperliquid.xyz/ws',
  infoUrl: 'https://api.hyperliquid.xyz/info'
};
const WHALE_NOTIONAL = 50000;
const AIRSTRIKE_NOTIONAL = 200000;
const SOUND_MASTER_GAIN = .48;
const formatPrice = (value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`;
const formatAxisPrice = (value) => Number(value).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
const formatNotional = (value) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};
const formatSize = (value) => Number(value).toLocaleString('en-US', { maximumFractionDigits: 3 });
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const el = (id) => document.getElementById(id);
const FRONT_LINE_MAX_X = 14;

// Order-book imbalances are usually only a few percent. A linear mapping made
// those differences almost invisible, so use a perceptual curve while keeping
// the extreme positions safely away from either base.
function frontPositionFromImbalance(imbalance) {
  const pressure = clamp(Number.isFinite(imbalance) ? imbalance : 0, -1, 1);
  const magnitude = Math.pow(Math.abs(pressure), .62) * FRONT_LINE_MAX_X;
  return -Math.sign(pressure) * magnitude;
}

const translations = {
  zh: {
    meta_title: 'SKHYNIX · 订单簿战场',
    meta_description: 'Hyperliquid SKHYNIX（API：xyz:SKHX）实时订单簿 3D 战场可视化',
    brand_home: 'SKHYNIX 订单簿战场首页',
    page_tools: '页面工具',
    market_overview: '市场概况',
    battlefield_region: '3D 订单簿战场',
    depth_region: '订单簿深度',
    depth_chart_aria: '买卖盘深度曲线',
    feed_region: '实时战报',
    mission_motto: 'SKHYNIX 订单簿攻防',
    commander_message: '全员盯紧前线！',
    reset_camera: '重置视角',
    live_data: 'HL / 实时',
    sell_force: 'ASK DEPTH · 前 10 档卖盘',
    buy_force: 'BID DEPTH · 前 10 档买盘',
    buyer_advancing: '前 10 档买盘占优',
    seller_advancing: '前 10 档卖盘占优',
    bear_base: '卖盘阵地',
    bull_base: '买盘阵地',
    infantry: '步兵',
    small_contract_order: '小额 · 挂单价位',
    tank: '坦克',
    large_order: '$50K+ · 大额挂单档',
    aircraft: '战机',
    mega_order: '$200K+ · 大额主动成交',
    artillery: '炮火',
    market_trade: '主动成交 · 吃单',
    drag: '拖拽', rotate: '旋转', scroll: '滚轮', zoom: '缩放', right_click: '右键', pan: '平移',
    depth_title: '10 档聚合深度',
    battle_feed: '实时战报',
    book_activity: '前 10 档挂单数',
    spread: '价差',
    large_order_ratio: '大额挂单档占比',
    book_imbalance: '买卖失衡',
    disclaimer: 'XYZ HIP-3 SKHYNIX 永续合约 · 非 KRX 盘口 · 与 SK hynix、Hyperliquid 无官方关联 · 非投资建议',
    status_live: 'Hyperliquid · SKHYNIX 实时盘口',
    status_connecting: '正在连接 Hyperliquid',
    status_reconnecting: '连接中断 · 正在重试',
    status_manual_reconnect: '正在重新连接实时盘口',
    small_buy: '主动买入成交',
    small_sell: '主动卖出成交',
    whale_buy: '大额主动买入成交',
    whale_sell: '大额主动卖出成交',
    airstrike_buy: '超大额主动买入成交',
    airstrike_sell: '超大额主动卖出成交',
    contract_unit: 'SKHX',
    orders_short: '{count} 单',
    sound_on: '关闭战场音效',
    sound_off: '开启战场音效',
    sound_unsupported: '当前浏览器不支持战场音效',
    sound_unsupported_title: '当前浏览器不支持 Web Audio',
    sound_blocked: '音效被浏览器阻止，点击重试',
    sound_blocked_title: '音效被浏览器阻止，请允许此网站播放声音',
    switch_language: 'Switch to English'
  },
  en: {
    meta_title: 'SKHYNIX · Orderbook Battlefield',
    meta_description: 'Hyperliquid SKHYNIX (API: xyz:SKHX) live orderbook visualized as a 3D battlefield',
    brand_home: 'SKHYNIX Orderbook Battlefield home',
    page_tools: 'Page controls',
    market_overview: 'Market overview',
    battlefield_region: '3D orderbook battlefield',
    depth_region: 'Orderbook depth',
    depth_chart_aria: 'Bid and ask depth chart',
    feed_region: 'Live battle feed',
    mission_motto: 'SKHYNIX ORDERBOOK BATTLE',
    commander_message: 'Eyes on the front line!',
    reset_camera: 'RESET VIEW',
    live_data: 'HL / LIVE',
    sell_force: 'TOP-10 ASK DEPTH',
    buy_force: 'TOP-10 BID DEPTH',
    buyer_advancing: 'Top-10 bid depth leads',
    seller_advancing: 'Top-10 ask depth leads',
    bear_base: 'Ask Base',
    bull_base: 'Bid Base',
    infantry: 'Infantry',
    small_contract_order: 'Smaller book levels',
    tank: 'Tank',
    large_order: '$50K+ aggregated book levels',
    aircraft: 'Aircraft',
    mega_order: '$200K+ large taker trades',
    artillery: 'Artillery',
    market_trade: 'Market-taking trades',
    drag: 'DRAG', rotate: 'Rotate', scroll: 'SCROLL', zoom: 'Zoom', right_click: 'RIGHT CLICK', pan: 'Pan',
    depth_title: 'Aggregated 10-level depth',
    battle_feed: 'Live battle feed',
    book_activity: 'Orders in top 10 levels',
    spread: 'Spread',
    large_order_ratio: 'Large-level share',
    book_imbalance: 'Book imbalance',
    disclaimer: 'XYZ HIP-3 SKHYNIX perpetual · Not the KRX book · Not affiliated with SK hynix or Hyperliquid · Not investment advice',
    status_live: 'Hyperliquid · SKHYNIX live orderbook',
    status_connecting: 'Connecting to Hyperliquid',
    status_reconnecting: 'Connection lost · Reconnecting',
    status_manual_reconnect: 'Reconnecting live orderbook',
    small_buy: 'Taker buy filled',
    small_sell: 'Taker sell filled',
    whale_buy: 'Large taker buy filled',
    whale_sell: 'Large taker sell filled',
    airstrike_buy: 'Very large taker buy filled',
    airstrike_sell: 'Very large taker sell filled',
    contract_unit: 'SKHX',
    orders_short: '{count} ORD',
    sound_on: 'Disable battlefield sound',
    sound_off: 'Enable battlefield sound',
    sound_unsupported: 'Battlefield sound is not supported in this browser',
    sound_unsupported_title: 'This browser does not support Web Audio',
    sound_blocked: 'Audio was blocked; click to retry',
    sound_blocked_title: 'Allow this site to play audio, then try again',
    switch_language: 'Switch to Korean'
  },
  ko: {
    meta_title: 'SKHYNIX · 오더북 배틀필드',
    meta_description: 'Hyperliquid SKHYNIX(API: xyz:SKHX) 실시간 오더북을 3D 전장으로 시각화',
    brand_home: 'SKHYNIX 오더북 배틀필드 홈',
    page_tools: '페이지 도구',
    market_overview: '시장 개요',
    battlefield_region: '3D 오더북 전장',
    depth_region: '오더북 깊이',
    depth_chart_aria: '매수·매도 호가 깊이 차트',
    feed_region: '실시간 전황',
    mission_motto: 'SKHYNIX 오더북 공방',
    commander_message: '모두 전선을 주시하라!',
    reset_camera: '시점 초기화',
    live_data: 'HL / 실시간',
    sell_force: 'ASK DEPTH · 상위 10단계 매도',
    buy_force: 'BID DEPTH · 상위 10단계 매수',
    buyer_advancing: '상위 10단계 매수 호가 우세',
    seller_advancing: '상위 10단계 매도 호가 우세',
    bear_base: '매도 진영',
    bull_base: '매수 진영',
    infantry: '보병',
    small_contract_order: '소액 · 호가 구간',
    tank: '전차',
    large_order: '$50K+ · 대형 집계 호가',
    aircraft: '전투기',
    mega_order: '$200K+ · 대형 테이커 체결',
    artillery: '포격',
    market_trade: '시장가 체결 · 테이커',
    drag: '드래그', rotate: '회전', scroll: '스크롤', zoom: '확대', right_click: '우클릭', pan: '이동',
    depth_title: '10단계 집계 호가',
    battle_feed: '실시간 전황',
    book_activity: '상위 10단계 주문 수',
    spread: '스프레드',
    large_order_ratio: '대형 호가 구간 비중',
    book_imbalance: '매수·매도 불균형',
    disclaimer: 'XYZ HIP-3 SKHYNIX 무기한 계약 · KRX 호가 아님 · SK hynix 또는 Hyperliquid와 공식 관련 없음 · 투자 조언 아님',
    status_live: 'Hyperliquid · SKHYNIX 실시간 호가',
    status_connecting: 'Hyperliquid 연결 중',
    status_reconnecting: '연결 끊김 · 재연결 중',
    status_manual_reconnect: '실시간 호가 재연결 중',
    small_buy: '테이커 매수 체결',
    small_sell: '테이커 매도 체결',
    whale_buy: '대형 테이커 매수 체결',
    whale_sell: '대형 테이커 매도 체결',
    airstrike_buy: '초대형 테이커 매수 체결',
    airstrike_sell: '초대형 테이커 매도 체결',
    contract_unit: 'SKHX',
    orders_short: '{count}건',
    sound_on: '전장 음향 끄기',
    sound_off: '전장 음향 켜기',
    sound_unsupported: '이 브라우저는 전장 음향을 지원하지 않습니다',
    sound_unsupported_title: '이 브라우저는 Web Audio를 지원하지 않습니다',
    sound_blocked: '브라우저가 음향을 차단했습니다. 다시 클릭하세요',
    sound_blocked_title: '사이트의 음향 재생을 허용한 뒤 다시 시도하세요',
    switch_language: '중국어로 전환'
  }
};

const languageOrder = ['zh', 'en', 'ko'];
const languageTags = { zh: 'zh-CN', en: 'en', ko: 'ko-KR' };
const languageButtonLabels = { zh: 'EN', en: '한국어', ko: '中文' };
const detectBrowserLanguage = () => {
  const preferences = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
  for (const preference of preferences) {
    const language = preference.toLowerCase();
    if (language.startsWith('zh')) return 'zh';
    if (language.startsWith('ko')) return 'ko';
    if (language.startsWith('en')) return 'en';
  }
  return 'en';
};
let currentLanguage = (() => {
  try {
    const saved = localStorage.getItem('skhx-language');
    if (languageOrder.includes(saved)) return saved;
  } catch { /* Fall back to browser preferences when storage is unavailable. */ }
  return detectBrowserLanguage();
})();
let currentConnectionStatus = 'connecting';
const t = (key, values = {}) => {
  const template = translations[currentLanguage][key] ?? translations.zh[key] ?? key;
  return Object.entries(values).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, value), template);
};

class HyperliquidOrderbookAdapter {
  constructor() {
    this.socket = null;
    this.book = null;
    this.context = {};
    this.pendingTrade = null;
    this.reconnectAttempt = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.emitTimer = null;
    this.stopped = false;
  }

  connect(onSnapshot, onStatus) {
    this.onSnapshot = onSnapshot;
    this.onStatus = onStatus;
    this.stopped = false;
    this.open();
    void this.hydrateContext();
  }

  async hydrateContext() {
    try {
      const response = await fetch(MARKET.infoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'metaAndAssetCtxs', dex: MARKET.dex })
      });
      if (!response.ok) return;
      const [meta, contexts] = await response.json();
      const index = meta.universe.findIndex((asset) => asset.name === MARKET.coin);
      if (index >= 0) {
        this.context = { ...this.context, ...contexts[index] };
        this.scheduleEmit();
      }
    } catch {
      // The websocket still provides the live book if the context request is unavailable.
    }
  }

  open() {
    clearTimeout(this.reconnectTimer);
    this.onStatus?.(this.reconnectAttempt ? 'reconnecting' : 'connecting');
    this.socket = new WebSocket(MARKET.websocketUrl);
    this.socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.onStatus?.('live');
      ['l2Book', 'trades', 'activeAssetCtx'].forEach((type) => {
        this.socket.send(JSON.stringify({ method: 'subscribe', subscription: { type, coin: MARKET.coin } }));
      });
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = setInterval(() => {
        if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify({ method: 'ping' }));
      }, 30000);
    };
    this.socket.onmessage = (event) => this.handleMessage(JSON.parse(event.data));
    this.socket.onerror = () => this.onStatus?.('reconnecting');
    this.socket.onclose = () => {
      clearInterval(this.heartbeatTimer);
      if (this.stopped) return;
      this.onStatus?.('reconnecting');
      const delay = Math.min(10000, 800 * 2 ** this.reconnectAttempt);
      this.reconnectAttempt += 1;
      this.reconnectTimer = setTimeout(() => this.open(), delay);
    };
  }

  handleMessage(message) {
    if (message.channel === 'l2Book' && message.data?.coin === MARKET.coin) {
      this.book = message.data;
      this.scheduleEmit();
      return;
    }
    if (message.channel === 'trades' && Array.isArray(message.data)) {
      const trade = [...message.data].reverse().find((row) => row.coin === MARKET.coin);
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
    if (message.channel === 'activeAssetCtx' && message.data?.coin === MARKET.coin) {
      this.context = { ...this.context, ...(message.data.ctx ?? message.data) };
      this.scheduleEmit();
    }
  }

  scheduleEmit(immediate = false) {
    if (!this.book || this.emitTimer) return;
    this.emitTimer = setTimeout(() => {
      this.emitTimer = null;
      this.emitSnapshot();
    }, immediate ? 0 : 100);
  }

  emitSnapshot() {
    if (!this.book) return;
    const normalizeLevel = (level) => ({
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
    const whaleNotional = [...bids, ...asks]
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
      whaleRatio: totalNotional ? whaleNotional / totalNotional : 0,
      trade
    });
  }

  reconnect() {
    this.socket?.close();
  }

  disconnect() {
    this.stopped = true;
    clearTimeout(this.reconnectTimer);
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.emitTimer);
    this.socket?.close();
  }
}

class BattlefieldSoundEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.compressor = null;
    this.enabled = false;
    this.lastShotAt = 0;
    this.lastImpactAt = 0;
  }

  async setEnabled(enabled) {
    if (enabled) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return false;
      if (!this.context) {
        this.context = new AudioContextClass();
        this.master = this.context.createGain();
        this.compressor = this.context.createDynamicsCompressor();
        this.master.gain.value = SOUND_MASTER_GAIN;
        this.compressor.threshold.value = -16;
        this.compressor.knee.value = 18;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = .006;
        this.compressor.release.value = .18;
        this.master.connect(this.compressor);
        this.compressor.connect(this.context.destination);
      }
      if (this.context.state === 'suspended') {
        const resumed = await Promise.race([
          this.context.resume().then(() => true).catch(() => false),
          new Promise((resolve) => setTimeout(() => resolve(false), 800))
        ]);
        if (!resumed && this.context.state !== 'running') return false;
      }
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.setTargetAtTime(SOUND_MASTER_GAIN, this.context.currentTime, .02);
      this.enabled = true;
      this.playActivation();
      return true;
    }
    this.enabled = false;
    if (this.context && this.master) this.master.gain.setTargetAtTime(0, this.context.currentTime, .025);
    return false;
  }

  createOutput(side, volume = 1) {
    const gain = this.context.createGain();
    gain.gain.value = volume;
    if (typeof this.context.createStereoPanner === 'function') {
      const panner = this.context.createStereoPanner();
      panner.pan.value = side === 'buy' ? .48 : -.48;
      gain.connect(panner);
      panner.connect(this.master);
    } else {
      gain.connect(this.master);
    }
    return gain;
  }

  playActivation() {
    if (!this.enabled) return;
    const now = this.context.currentTime;
    [440, 660].forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.createOutput('buy', .11);
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, now + index * .08);
      gain.gain.exponentialRampToValueAtTime(.11, now + index * .08 + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + index * .08 + .12);
      oscillator.connect(gain);
      oscillator.start(now + index * .08);
      oscillator.stop(now + index * .08 + .13);
    });
  }

  playShot(side, whale) {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastShotAt < (whale ? 260 : 140)) return;
    this.lastShotAt = nowMs;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.createOutput(side, whale ? .28 : .085);
    oscillator.type = whale ? 'sawtooth' : 'square';
    oscillator.frequency.setValueAtTime(whale ? 118 : side === 'buy' ? 540 : 420, now);
    oscillator.frequency.exponentialRampToValueAtTime(whale ? 38 : 145, now + (whale ? .32 : .075));
    gain.gain.setValueAtTime(whale ? .28 : .085, now);
    gain.gain.exponentialRampToValueAtTime(.0001, now + (whale ? .34 : .085));
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + (whale ? .35 : .09));
    if (whale) this.playNoise(side, .18, .24, 520);
  }

  playImpact(side, whale) {
    if (!this.enabled) return;
    const nowMs = performance.now();
    if (nowMs - this.lastImpactAt < (whale ? 320 : 170)) return;
    this.lastImpactAt = nowMs;
    this.playNoise(side, whale ? .3 : .075, whale ? .48 : .12, whale ? 360 : 900);
    if (!whale) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.createOutput(side, .32);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(74, now);
    oscillator.frequency.exponentialRampToValueAtTime(28, now + .5);
    gain.gain.setValueAtTime(.32, now);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .52);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + .53);
  }

  playNoise(side, volume, duration, cutoff) {
    const frameCount = Math.ceil(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i += 1) samples[i] = (Math.random() * 2 - 1) * (1 - i / frameCount);
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const gain = this.createOutput(side, volume);
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    source.start();
  }
}

const soundEngine = new BattlefieldSoundEngine();

const stage = el('battle-stage');
const canvas = el('battlefield');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(stage.clientWidth, stage.clientHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x21151d);
scene.fog = new THREE.FogExp2(0x21151d, .024);

const camera = new THREE.PerspectiveCamera(42, stage.clientWidth / stage.clientHeight, .1, 180);
const defaultCamera = new THREE.Vector3(0, 28, 34);
camera.position.copy(defaultCamera);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 1);
controls.enableDamping = true;
controls.dampingFactor = .065;
controls.minDistance = 22;
controls.maxDistance = 62;
controls.maxPolarAngle = Math.PI * .46;
controls.minPolarAngle = Math.PI * .17;
controls.enablePan = true;

scene.add(new THREE.HemisphereLight(0xffe8c7, 0x3b1728, 2.2));
const sun = new THREE.DirectionalLight(0xffedcf, 3.1);
sun.position.set(-15, 27, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -44;
sun.shadow.camera.right = 44;
sun.shadow.camera.top = 28;
sun.shadow.camera.bottom = -28;
scene.add(sun);
const greenGlow = new THREE.PointLight(0x35c98a, 42, 36, 2);
greenGlow.position.set(22, 5, -2);
scene.add(greenGlow);
const redGlow = new THREE.PointLight(0xee214b, 38, 36, 2);
redGlow.position.set(-22, 5, -2);
scene.add(redGlow);

const world = new THREE.Group();
scene.add(world);
const priceMarkers = [];
const battleState = { frontX: 0, targetFrontX: 0 };
let frontLineVisual = null;
let bearTerritory = null;
let bullTerritory = null;

function terrainHeight(x, z) {
  return Math.sin(x * .18) * .18 + Math.cos(z * .35) * .15 + Math.sin((x + z) * .46) * .07;
}

function buildTerrain() {
  const geo = new THREE.PlaneGeometry(72, 40, 72, 40);
  const colors = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, terrainHeight(x, -y));
    const center = 1 - Math.min(1, Math.abs(x) / 37);
    const color = new THREE.Color(x < 0 ? 0x61243a : 0x285b47);
    color.lerp(new THREE.Color(0x5c3d59), center * .62);
    color.offsetHSL(0, 0, Math.sin(y * .5 + x) * .018);
    colors.push(color.r, color.g, color.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0x24121c, emissiveIntensity: .32, roughness: .95, metalness: .03 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  world.add(mesh);

  const underGeo = new THREE.BoxGeometry(72, 2.1, 40);
  const under = new THREE.Mesh(underGeo, new THREE.MeshStandardMaterial({ color: 0x1b1218, roughness: 1 }));
  under.position.y = -1.3;
  under.receiveShadow = true;
  world.add(under);

  for (let i = -5; i <= 5; i += 1) {
    const x = i * 5.6;
    if (i === 0) continue;
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, terrainHeight(x, -18) + .05, -18),
      new THREE.Vector3(x, terrainHeight(x, 18) + .05, 18)
    ]);
    const line = new THREE.Line(lineGeo, new THREE.LineDashedMaterial({ color: 0xffdfb3, opacity: .28, transparent: true, dashSize: .22, gapSize: .32 }));
    line.computeLineDistances();
    world.add(line);
    addPriceMarker(x, 15.5, i);
  }

  const territoryMaterial = (color) => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: .12,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -1
  });
  bearTerritory = new THREE.Mesh(new THREE.PlaneGeometry(1, 40), territoryMaterial(0xee214b));
  bullTerritory = new THREE.Mesh(new THREE.PlaneGeometry(1, 40), territoryMaterial(0x35c98a));
  for (const territory of [bearTerritory, bullTerritory]) {
    territory.rotation.x = -Math.PI / 2;
    territory.position.y = .09;
    territory.renderOrder = 1;
    world.add(territory);
  }

  frontLineVisual = new THREE.Group();
  const frontPoints = [];
  for (let z = -18; z <= 18; z += .75) frontPoints.push(new THREE.Vector3(0, .32, z));
  const frontGeo = new THREE.BufferGeometry().setFromPoints(frontPoints);
  const frontGlow = new THREE.Line(frontGeo, new THREE.LineBasicMaterial({ color: 0xffdfef, transparent: true, opacity: .2 }));
  const frontDash = new THREE.Line(frontGeo.clone(), new THREE.LineDashedMaterial({ color: 0xffffff, transparent: true, opacity: .88, dashSize: .7, gapSize: .4 }));
  frontDash.computeLineDistances();
  frontLineVisual.add(frontGlow, frontDash);
  frontLineVisual.renderOrder = 2;
  world.add(frontLineVisual);

  const road = new THREE.Mesh(new THREE.PlaneGeometry(70, 1.9), new THREE.MeshStandardMaterial({ color: 0x241a22, roughness: .8 }));
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, .2, 2.8);
  road.receiveShadow = true;
  world.add(road);
  for (let x = -33; x < 34; x += 3.2) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(1.7, .07), new THREE.MeshBasicMaterial({ color: 0xffcf80, transparent: true, opacity: .6 }));
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(x, .225, 2.8);
    world.add(dash);
  }
}

function addPriceMarker(x, z, offset) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  const texture = new THREE.CanvasTexture(c);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.position.set(x, .3, z);
  sprite.scale.set(4, 1, 1);
  world.add(sprite);
  priceMarkers.push({ offset, ctx, texture });
}

function updatePriceMarkers(price) {
  priceMarkers.forEach(({ offset, ctx, texture }) => {
    ctx.clearRect(0, 0, 256, 64);
    ctx.font = '600 28px IBM Plex Mono';
    ctx.fillStyle = 'rgba(255,238,218,.72)';
    ctx.textAlign = 'center';
    ctx.fillText(formatAxisPrice(price + offset * MARKET.tick), 128, 38);
    texture.needsUpdate = true;
  });
}

function addStructures() {
  const mat = new THREE.MeshStandardMaterial({ color: 0x493342, roughness: .9 });
  [[-29,-11],[-25,12],[27,-11],[30,10]].forEach(([x,z], idx) => {
    const group = new THREE.Group();
    for (let i = 0; i < 3; i += 1) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(1.4 + i * .3, .75 + i * .2, 1.2), mat);
      box.position.set(i * 1.6, .45 + i * .1, (i % 2) * 1.4);
      box.castShadow = true;
      group.add(box);
    }
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, 3.6, 6), mat);
    tower.position.set(1.7, 1.8, -1.1);
    group.add(tower);
    group.position.set(x, 0, z);
    group.rotation.y = idx * .7;
    world.add(group);
  });
}

const unitState = { bullInfantry: [], bearInfantry: [], bullTanks: [], bearTanks: [], bullAircraft: [], bearAircraft: [] };

function makeInfantry(side, count = 70) {
  const color = side === 'buy' ? 0x48dca0 : 0xff365b;
  const dark = side === 'buy' ? 0x146448 : 0x8f1731;
  const bodyGeo = new THREE.CapsuleGeometry(.13, .38, 2, 5);
  const headGeo = new THREE.SphereGeometry(.14, 6, 5);
  const bodies = new THREE.InstancedMesh(bodyGeo, new THREE.MeshStandardMaterial({ color: dark, emissive: color, emissiveIntensity: .22, roughness: .7 }), count);
  const heads = new THREE.InstancedMesh(headGeo, new THREE.MeshStandardMaterial({ color, roughness: .65 }), count);
  bodies.castShadow = true;
  heads.castShadow = true;
  world.add(bodies, heads);
  const dummy = new THREE.Object3D();
  const records = [];
  for (let i = 0; i < count; i += 1) {
    const lane = (Math.random() - .5) * 31;
    const depth = 5 + Math.pow(Math.random(), .58) * 24;
    records.push({ x: side === 'buy' ? depth : -depth, z: lane, speed: .025 + Math.random() * .035, sway: Math.random() * 10 });
  }
  return { side, bodies, heads, dummy, records };
}

function makeTank(side, x, z, scale = 1) {
  const group = new THREE.Group();
  const color = side === 'buy' ? 0x23875f : 0xb51e3d;
  const emissive = side === 'buy' ? 0x0e4c35 : 0x691126;
  const metal = new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: .18, roughness: .55, metalness: .35 });
  const tracks = new THREE.MeshStandardMaterial({ color: 0x1e171c, roughness: .95 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, .42, .9), metal);
  base.position.y = .42;
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(.34, .43, .32, 6), metal);
  turret.position.y = .78;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.055, .075, 1.15, 6), metal);
  barrel.rotation.z = Math.PI / 2;
  barrel.position.set(side === 'buy' ? -.62 : .62, .84, 0);
  for (const zOff of [-.52, .52]) {
    const track = new THREE.Mesh(new THREE.BoxGeometry(1.55, .25, .2), tracks);
    track.position.set(0, .25, zOff);
    group.add(track);
  }
  group.add(base, turret, barrel);
  group.position.set(x, terrainHeight(x, z), z);
  group.scale.setScalar(scale);
  // The barrel offset already points each faction toward the front line:
  // bulls on the right aim left, bears on the left aim right.
  group.rotation.y = 0;
  group.traverse((obj) => { if (obj.isMesh) obj.castShadow = true; });
  world.add(group);
  return { side, group, baseX: x, z, speed: .008 + Math.random() * .012, phase: Math.random() * 8 };
}

function makeAircraft(side, x, z, altitude, scale = 1) {
  const group = new THREE.Group();
  const color = side === 'buy' ? 0x59e0aa : 0xff5270;
  const dark = side === 'buy' ? 0x185d47 : 0x64172a;
  const metal = new THREE.MeshStandardMaterial({ color: dark, emissive: color, emissiveIntensity: .3, roughness: .38, metalness: .62 });

  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(.12, .18, 1.75, 8), metal);
  fuselage.rotation.z = Math.PI / 2;
  const nose = new THREE.Mesh(new THREE.ConeGeometry(.18, .48, 8), metal);
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = 1.08;
  const wings = new THREE.Mesh(new THREE.BoxGeometry(.7, .07, 2.05), metal);
  wings.position.x = -.08;
  const tailWing = new THREE.Mesh(new THREE.BoxGeometry(.35, .06, .9), metal);
  tailWing.position.x = -.72;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(.34, .48, .07), metal);
  tail.position.set(-.72, .22, 0);
  group.add(fuselage, nose, wings, tailWing, tail);
  group.position.set(x, altitude, z);
  group.rotation.y = side === 'buy' ? Math.PI : 0;
  group.scale.setScalar(scale);
  group.traverse((obj) => { if (obj.isMesh) obj.castShadow = true; });
  world.add(group);
  return { side, group, altitude, baseZ: z, speed: .018 + Math.random() * .012, phase: Math.random() * Math.PI * 2 };
}

function buildArmies() {
  unitState.bullInfantry.push(makeInfantry('buy', 78));
  unitState.bearInfantry.push(makeInfantry('sell', 66));
  for (let i = 0; i < 9; i += 1) {
    unitState.bullTanks.push(makeTank('buy', 9 + Math.random() * 20, -13 + Math.random() * 26, .75 + Math.random() * .35));
    unitState.bearTanks.push(makeTank('sell', -9 - Math.random() * 20, -13 + Math.random() * 26, .75 + Math.random() * .35));
  }
  for (let i = 0; i < 3; i += 1) {
    unitState.bullAircraft.push(makeAircraft('buy', 13 + i * 6, -9 + i * 8, 5.4 + i * .7, .8 + i * .08));
    unitState.bearAircraft.push(makeAircraft('sell', -13 - i * 6, 9 - i * 8, 5.7 + i * .7, .8 + i * .08));
  }
}

const projectileGroup = new THREE.Group();
world.add(projectileGroup);
const projectiles = [];
function fireProjectile(side, whale = false, airstrike = false) {
  const frontX = battleState.frontX;
  const fromX = side === 'buy' ? frontX + 8 + Math.random() * 11 : frontX - 8 - Math.random() * 11;
  const targetX = side === 'buy' ? frontX - 1 - Math.random() * 5 : frontX + 1 + Math.random() * 5;
  const z = -12 + Math.random() * 24;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(airstrike ? .26 : whale ? .18 : .1, 8, 6), new THREE.MeshBasicMaterial({ color: side === 'buy' ? 0x7affc5 : 0xff7890 }));
  mesh.position.set(fromX, airstrike ? 5.5 : 1.2, z);
  projectileGroup.add(mesh);
  projectiles.push({ mesh, fromX, targetX, z, progress: 0, speed: airstrike ? .014 : whale ? .018 : .028, side, whale: whale || airstrike, airstrike });
  soundEngine.playShot(side, whale || airstrike);
}

const explosions = [];
function explode(position, side, whale) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: side === 'buy' ? 0x65e9b1 : 0xff4968, transparent: true, opacity: .85, depthWrite: false }));
  mesh.position.copy(position);
  mesh.scale.setScalar(.1);
  projectileGroup.add(mesh);
  explosions.push({ mesh, age: 0, max: whale ? 1.65 : .9 });
  soundEngine.playImpact(side, whale);
}

buildTerrain();
addStructures();
buildArmies();

let latestSnapshot = null;
function updateInfantryPack(pack, time, pressure) {
  const direction = pack.side === 'buy' ? -1 : 1;
  const sidePressure = pack.side === 'buy' ? pressure : -pressure;
  pack.records.forEach((record, i) => {
    const frontLimit = battleState.frontX + (pack.side === 'buy' ? 1.15 : -1.15);
    const pace = .45 + (sidePressure + 1) * .55;
    record.x += direction * record.speed * pace;
    if ((pack.side === 'buy' && record.x < frontLimit) || (pack.side === 'sell' && record.x > frontLimit)) {
      record.x = (pack.side === 'buy' ? 20 : -20) + (pack.side === 'buy' ? 1 : -1) * Math.random() * 12;
      record.z = (Math.random() - .5) * 31;
    }
    const y = terrainHeight(record.x, record.z) + .38 + Math.sin(time * 3 + record.sway) * .025;
    pack.dummy.position.set(record.x, y, record.z);
    pack.dummy.rotation.y = pack.side === 'buy' ? -Math.PI / 2 : Math.PI / 2;
    pack.dummy.updateMatrix();
    pack.bodies.setMatrixAt(i, pack.dummy.matrix);
    pack.dummy.position.y = y + .39;
    pack.dummy.updateMatrix();
    pack.heads.setMatrixAt(i, pack.dummy.matrix);
  });
  pack.bodies.instanceMatrix.needsUpdate = true;
  pack.heads.instanceMatrix.needsUpdate = true;
}

function animateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i -= 1) {
    const shot = projectiles[i];
    shot.progress += shot.speed;
    const p = shot.progress;
    shot.mesh.position.x = THREE.MathUtils.lerp(shot.fromX, shot.targetX, p);
    shot.mesh.position.y = shot.airstrike ? THREE.MathUtils.lerp(5.5, .7, p) + Math.sin(p * Math.PI) * 2 : .7 + Math.sin(p * Math.PI) * (shot.whale ? 7 : 4);
    shot.mesh.position.z = shot.z + Math.sin(p * Math.PI) * 1.4;
    if (p >= 1) {
      explode(shot.mesh.position, shot.side, shot.whale);
      projectileGroup.remove(shot.mesh);
      projectiles.splice(i, 1);
    }
  }
  for (let i = explosions.length - 1; i >= 0; i -= 1) {
    const blast = explosions[i];
    blast.age += .035;
    blast.mesh.scale.setScalar(blast.age * blast.max);
    blast.mesh.material.opacity = Math.max(0, .85 - blast.age);
    if (blast.age > .9) {
      projectileGroup.remove(blast.mesh);
      explosions.splice(i, 1);
    }
  }
}

const frontLabel = document.querySelector('.price-front');
const projectedFront = new THREE.Vector3();
let previousFrameTime = 0;

function updateFrontLine(delta) {
  battleState.frontX = THREE.MathUtils.damp(battleState.frontX, battleState.targetFrontX, 3.2, delta);
  const frontX = battleState.frontX;
  if (frontLineVisual) frontLineVisual.position.x = frontX;

  const bearWidth = 36 + frontX;
  const bullWidth = 36 - frontX;
  if (bearTerritory) {
    bearTerritory.scale.x = bearWidth;
    bearTerritory.position.x = -36 + bearWidth / 2;
  }
  if (bullTerritory) {
    bullTerritory.scale.x = bullWidth;
    bullTerritory.position.x = frontX + bullWidth / 2;
  }

  if (frontLabel) {
    projectedFront.set(frontX, 1.1, -12).project(camera);
    frontLabel.style.left = `${clamp((projectedFront.x + 1) * 50, 5, 95)}%`;
    frontLabel.style.top = `${clamp((1 - projectedFront.y) * 50, 10, 70)}%`;
  }
}

function animate(timeMs) {
  const time = timeMs * .001;
  const delta = previousFrameTime ? Math.min((timeMs - previousFrameTime) * .001, .1) : 1 / 60;
  previousFrameTime = timeMs;
  requestAnimationFrame(animate);
  const pressure = latestSnapshot?.imbalance ?? .08;
  updateFrontLine(delta);
  unitState.bullInfantry.forEach((pack) => updateInfantryPack(pack, time, pressure));
  unitState.bearInfantry.forEach((pack) => updateInfantryPack(pack, time, pressure));
  [...unitState.bullTanks, ...unitState.bearTanks].forEach((tank) => {
    const sign = tank.side === 'buy' ? -1 : 1;
    const favor = tank.side === 'buy' ? pressure : -pressure;
    const limit = battleState.frontX + (tank.side === 'buy' ? 2.6 : -2.6);
    tank.group.position.x += sign * tank.speed * (.5 + (favor + 1) * .5);
    if ((tank.side === 'buy' && tank.group.position.x < limit) || (tank.side === 'sell' && tank.group.position.x > limit)) {
      tank.group.position.x = tank.side === 'buy' ? Math.max(tank.baseX, battleState.frontX + 7) : Math.min(tank.baseX, battleState.frontX - 7);
    }
    tank.group.position.y = terrainHeight(tank.group.position.x, tank.z) + Math.sin(time * 2 + tank.phase) * .02;
  });
  [...unitState.bullAircraft, ...unitState.bearAircraft].forEach((aircraft) => {
    const direction = aircraft.side === 'buy' ? -1 : 1;
    const sidePressure = aircraft.side === 'buy' ? pressure : -pressure;
    aircraft.group.position.x += direction * aircraft.speed * (.7 + (sidePressure + 1) * .35);
    const limit = battleState.frontX + (aircraft.side === 'buy' ? -4 : 4);
    if ((aircraft.side === 'buy' && aircraft.group.position.x < limit) || (aircraft.side === 'sell' && aircraft.group.position.x > limit)) {
      aircraft.group.position.x = battleState.frontX + (aircraft.side === 'buy' ? 24 : -24);
    }
    aircraft.group.position.y = aircraft.altitude + Math.sin(time * 1.8 + aircraft.phase) * .32;
    aircraft.group.position.z = aircraft.baseZ + Math.sin(time * .65 + aircraft.phase) * 2.4;
    aircraft.group.rotation.z = Math.sin(time * 1.3 + aircraft.phase) * .08;
  });
  animateProjectiles();
  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

function depthPath(rows, side) {
  const isBid = side === 'bid';
  const startX = 230;
  const width = 215;
  const max = Math.max(...rows.map((r) => r.quantity));
  let cumulative = 0;
  const points = rows.map((row, i) => {
    cumulative += row.quantity;
    const x = startX + (isBid ? -1 : 1) * ((i + 1) / rows.length) * width;
    const y = 105 - (cumulative / (max * rows.length * .65)) * 82;
    return [x, clamp(y, 16, 104)];
  });
  const line = points.map(([x, y], i) => `${i ? 'L' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const edge = isBid ? 10 : 450;
  return `M ${startX} 108 ${line} L ${edge} 108 Z`;
}

const feedHistory = [];

function renderFeed() {
  const feed = el('feed-list');
  feed.innerHTML = feedHistory.map((trade) => {
    const labelKey = trade.airstrike ? (trade.side === 'buy' ? 'airstrike_buy' : 'airstrike_sell') : trade.whale ? (trade.side === 'buy' ? 'whale_buy' : 'whale_sell') : (trade.side === 'buy' ? 'small_buy' : 'small_sell');
    const icon = trade.airstrike ? 'AF' : trade.whale ? 'TK' : 'IN';
    return `<div class="feed-item ${trade.side}"><span class="feed-icon">${icon}</span><div class="feed-copy"><strong>${t(labelKey)}</strong><small>${formatSize(trade.quantity)} ${t('contract_unit')} · ${formatNotional(trade.notional)} @ ${formatPrice(trade.price)}</small></div><span class="feed-side">${trade.side === 'buy' ? 'BUY' : 'SELL'}</span></div>`;
  }).join('');
}

function updateFeed(trade) {
  feedHistory.unshift(trade);
  if (feedHistory.length > 4) feedHistory.length = 4;
  renderFeed();
}

function updateUI(data, { effects = true } = {}) {
  latestSnapshot = data;
  battleState.targetFrontX = frontPositionFromImbalance(data.imbalance);
  const percent = ((data.price - data.previousClose) / data.previousClose) * 100;
  const imbalancePct = data.imbalance * 100;
  const orderCount = [...data.bids, ...data.asks].reduce((sum, row) => sum + row.orderCount, 0);
  el('last-price').textContent = formatPrice(data.price);
  el('front-price').textContent = formatAxisPrice(data.price);
  el('price-change').textContent = `${percent >= 0 ? '▲' : '▼'} ${Math.abs(percent).toFixed(2)}%`;
  el('price-change').className = `price-change ${percent >= 0 ? 'up' : 'down'}`;
  el('price-change').style.color = percent >= 0 ? 'var(--green)' : 'var(--red)';
  el('sell-force').textContent = formatNotional(data.askNotional);
  el('buy-force').textContent = formatNotional(data.bidNotional);
  el('pressure-copy').textContent = t(imbalancePct >= 0 ? 'buyer_advancing' : 'seller_advancing');
  el('imbalance-value').textContent = `${imbalancePct >= 0 ? '+' : ''}${imbalancePct.toFixed(1)}%`;
  el('imbalance-value').style.color = imbalancePct >= 0 ? 'var(--green)' : 'var(--red)';
  el('confidence-bar').style.width = `${clamp(50 + Math.abs(imbalancePct) * 2.2, 50, 94)}%`;
  el('confidence-bar').style.background = imbalancePct >= 0 ? 'var(--green)' : 'var(--red)';
  el('bull-units').textContent = `${formatSize(data.bidTotal)} ${t('contract_unit')}`;
  el('bear-units').textContent = `${formatSize(data.askTotal)} ${t('contract_unit')}`;
  el('bid-area').setAttribute('d', depthPath(data.bids, 'bid'));
  el('ask-area').setAttribute('d', depthPath(data.asks, 'ask'));
  el('low-price').textContent = formatAxisPrice(data.bids.at(-1).price);
  el('mid-price').textContent = formatAxisPrice(data.price);
  el('high-price').textContent = formatAxisPrice(data.asks.at(-1).price);
  el('trade-intensity').textContent = t('orders_short', { count: orderCount });
  el('spread-value').textContent = formatPrice(data.asks[0].price - data.bids[0].price);
  el('whale-ratio').textContent = `${(data.whaleRatio * 100).toFixed(1)}%`;
  el('footer-imbalance').textContent = `${imbalancePct >= 0 ? 'BUY' : 'SELL'} ${imbalancePct >= 0 ? '+' : ''}${imbalancePct.toFixed(1)}%`;
  el('footer-imbalance').className = imbalancePct >= 0 ? 'green' : 'red';
  updatePriceMarkers(data.price);
  if (effects && data.trade) {
    updateFeed(data.trade);
    fireProjectile(data.trade.side, data.trade.whale, data.trade.airstrike);
  }
}

function updateConnectionStatus(status) {
  currentConnectionStatus = status;
  const dot = document.querySelector('.live-dot');
  const pulse = document.querySelector('.pulse');
  const badge = document.querySelector('.sim-badge');
  dot.className = `live-dot ${status === 'live' ? '' : status === 'connecting' || status === 'reconnecting' ? 'connecting' : 'offline'}`;
  pulse.className = `pulse ${status === 'live' ? '' : status === 'connecting' || status === 'reconnecting' ? 'connecting' : 'offline'}`;
  if (status === 'live') {
    el('market-label').textContent = t('status_live');
    badge.textContent = 'LIVE BOOK';
    badge.className = 'sim-badge live';
  } else if (status === 'connecting') {
    el('market-label').textContent = t('status_connecting');
    badge.textContent = 'CONNECTING';
    badge.className = 'sim-badge';
  } else {
    el('market-label').textContent = t('status_reconnecting');
    badge.textContent = 'RECONNECTING';
    badge.className = 'sim-badge offline';
  }
}

const marketData = new HyperliquidOrderbookAdapter();
marketData.connect(updateUI, updateConnectionStatus);
window.addEventListener('beforeunload', () => marketData.disconnect());

function updateClock() {
  const value = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date());
  el('clock').textContent = `${value} KST`;
}
updateClock();
setInterval(updateClock, 1000);

el('reset-camera').addEventListener('click', () => {
  camera.position.copy(defaultCamera);
  controls.target.set(0, 0, 1);
  controls.update();
  trackEvent('reset_camera');
});

const soundToggle = el('sound-toggle');
const soundSupported = Boolean(window.AudioContext || window.webkitAudioContext);
let soundBlocked = false;

function refreshSoundToggle() {
  soundToggle.setAttribute('aria-pressed', String(soundEngine.enabled));
  if (!soundSupported) {
    soundToggle.disabled = true;
    soundToggle.textContent = '×';
    soundToggle.setAttribute('aria-label', t('sound_unsupported'));
    soundToggle.title = t('sound_unsupported_title');
  } else if (soundBlocked) {
    soundToggle.textContent = '!';
    soundToggle.setAttribute('aria-label', t('sound_blocked'));
    soundToggle.title = t('sound_blocked_title');
  } else {
    soundToggle.textContent = soundEngine.enabled ? '♫' : '♪';
    soundToggle.setAttribute('aria-label', t(soundEngine.enabled ? 'sound_on' : 'sound_off'));
    soundToggle.title = t(soundEngine.enabled ? 'sound_on' : 'sound_off');
  }
}

if (soundSupported) {
  soundToggle.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const wantsSound = !soundEngine.enabled;
    const soundOn = await soundEngine.setEnabled(wantsSound);
    if (wantsSound && !soundOn) {
      soundBlocked = true;
      refreshSoundToggle();
      return;
    }
    soundBlocked = false;
    button.setAttribute('aria-pressed', String(soundOn));
    refreshSoundToggle();
    trackEvent('toggle_sound', { enabled: soundOn });
  });
}

function applyLanguage(language) {
  currentLanguage = languageOrder.includes(language) ? language : 'zh';
  try { localStorage.setItem('skhx-language', currentLanguage); } catch { /* Storage can be unavailable in private contexts. */ }
  document.documentElement.lang = languageTags[currentLanguage];
  document.title = t('meta_title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta_description'));
  document.querySelectorAll('[data-i18n]').forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => { node.setAttribute('aria-label', t(node.dataset.i18nAria)); });
  const languageToggle = el('language-toggle');
  languageToggle.textContent = languageButtonLabels[currentLanguage];
  languageToggle.setAttribute('aria-label', t('switch_language'));
  refreshSoundToggle();
  renderFeed();
  if (latestSnapshot) updateUI(latestSnapshot, { effects: false });
  updateConnectionStatus(currentConnectionStatus);
}

el('language-toggle').addEventListener('click', () => {
  const currentIndex = languageOrder.indexOf(currentLanguage);
  applyLanguage(languageOrder[(currentIndex + 1) % languageOrder.length]);
  trackEvent('change_language', { language: currentLanguage });
});

el('data-toggle').addEventListener('click', () => {
  const badge = document.querySelector('.sim-badge');
  badge.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }], { duration: 240 });
  el('market-label').textContent = t('status_manual_reconnect');
  marketData.reconnect();
  trackEvent('reconnect_market_data');
});

const resizeObserver = new ResizeObserver(() => {
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
});
resizeObserver.observe(stage);

applyLanguage(currentLanguage);

export { HyperliquidOrderbookAdapter, frontPositionFromImbalance };
