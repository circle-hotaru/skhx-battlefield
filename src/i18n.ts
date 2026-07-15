export type Language = 'zh' | 'en' | 'ko';

export const translations = {
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
    drag: '拖拽',
    rotate: '旋转',
    scroll: '滚轮',
    zoom: '缩放',
    right_click: '右键',
    pan: '平移',
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
    drag: 'DRAG',
    rotate: 'Rotate',
    scroll: 'SCROLL',
    zoom: 'Zoom',
    right_click: 'RIGHT CLICK',
    pan: 'Pan',
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
    drag: '드래그',
    rotate: '회전',
    scroll: '스크롤',
    zoom: '확대',
    right_click: '우클릭',
    pan: '이동',
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
} as const;

export type TranslationKey = keyof typeof translations.zh;

export const languageOrder: Language[] = ['zh', 'en', 'ko'];
export const languageTags: Record<Language, string> = { zh: 'zh-CN', en: 'en', ko: 'ko-KR' };
export const languageButtonLabels: Record<Language, string> = { zh: 'EN', en: '한국어', ko: '中文' };

export function translate(language: Language, key: TranslationKey, values: Record<string, string | number> = {}) {
  const template: string = translations[language][key] ?? translations.zh[key] ?? key;
  return Object.entries(values).reduce<string>(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template
  );
}

export function detectBrowserLanguage(): Language {
  const preferences = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
  for (const preference of preferences) {
    const language = preference.toLowerCase();
    if (language.startsWith('zh')) return 'zh';
    if (language.startsWith('ko')) return 'ko';
    if (language.startsWith('en')) return 'en';
  }
  return 'en';
}

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('skhx-language');
    if (saved && languageOrder.includes(saved as Language)) return saved as Language;
  } catch {
    // Fall back to browser preferences when storage is unavailable.
  }
  return detectBrowserLanguage();
}
