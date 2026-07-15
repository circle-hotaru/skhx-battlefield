import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import './style.css';

function BattlefieldApp() {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#" aria-label="SKHYNIX 订单簿战场首页" data-i18n-aria="brand_home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <b>SKHX</b>
          </span>
          <span>
            <strong>SKHYNIX <em>BATTLEFIELD</em></strong>
            <small>HYPERLIQUID · xyz:SKHX</small>
          </span>
        </a>

        <div className="market-state" aria-live="polite">
          <span className="live-dot connecting" />
          <span id="market-label">正在连接 Hyperliquid</span>
          <span className="divider" />
          <span id="clock">--:--:-- KST</span>
        </div>

        <nav className="top-actions" aria-label="页面工具" data-i18n-aria="page_tools">
          <button className="icon-button" id="sound-toggle" type="button" aria-label="开启战场音效" aria-pressed="false" title="开启战场音效">♪</button>
          <button className="control-button" id="reset-camera" type="button" data-i18n="reset_camera">重置视角</button>
          <button className="control-button language-button" id="language-toggle" type="button" aria-label="Switch to English">EN</button>
          <button className="control-button primary" id="data-toggle" type="button">
            <span className="pulse connecting" />
            <span data-i18n="live_data">HL / 实时</span>
          </button>
        </nav>
      </header>

      <main className="battle-shell">
        <div className="mission-ribbon">
          <span>XYZ HIP-3 · LIVE ORDERBOOK</span>
          <strong data-i18n="mission_motto">SKHYNIX 订单簿攻防</strong>
          <span data-i18n="commander_message">全员盯紧前线！</span>
        </div>

        <section className="hero-stats" aria-label="市场概况" data-i18n-aria="market_overview">
          <div className="stat-left">
            <span className="eyebrow" data-i18n="sell_force">ASK DEPTH · 前 10 档卖盘</span>
            <strong className="force-value red" id="sell-force">--</strong>
            <span className="unit-caption">ASK NOTIONAL</span>
          </div>

          <div className="price-lockup">
            <span className="eyebrow">SKHYNIX PERP · XYZ HIP-3</span>
            <div className="price-row">
              <strong id="last-price">$--</strong>
              <span className="price-change" id="price-change">--</span>
            </div>
            <div className="pressure-line">
              <span id="pressure-copy" data-i18n="buyer_advancing">前 10 档买盘占优</span>
              <span className="confidence"><i id="confidence-bar" /></span>
              <span id="imbalance-value">--</span>
            </div>
          </div>

          <div className="stat-right">
            <span className="eyebrow" data-i18n="buy_force">BID DEPTH · 前 10 档买盘</span>
            <strong className="force-value green" id="buy-force">--</strong>
            <span className="unit-caption">BID NOTIONAL</span>
          </div>
        </section>

        <section className="battle-stage" id="battle-stage" aria-label="3D 订单簿战场" data-i18n-aria="battlefield_region">
          <canvas id="battlefield" />
          <div className="stage-vignette" />
          <div className="stage-noise" />

          <div className="stage-sticker">
            <span className="sticker-bolt">ϟ</span>
            <span><small>LIVE FRONT</small><strong>xyz:SKHX</strong></span>
          </div>

          <div className="side-banner bears">
            <span className="banner-icon">▼</span>
            <span><small>ASK FORCE</small><strong data-i18n="bear_base">卖盘阵地</strong></span>
            <em id="bear-units">--</em>
          </div>

          <div className="side-banner bulls">
            <span><small>BID FORCE</small><strong data-i18n="bull_base">买盘阵地</strong></span>
            <em id="bull-units">--</em>
            <span className="banner-icon">▲</span>
          </div>

          <div className="price-front">
            <span>FRONT LINE</span>
            <strong id="front-price">CONNECTING</strong>
          </div>

          <div className="legend-panel glass-panel">
            <div className="panel-kicker">UNIT LEGEND</div>
            <div className="legend-row">
              <span className="legend-symbol infantry-symbol" />
              <div><strong data-i18n="infantry">步兵</strong><small data-i18n="small_contract_order">小额 · 挂单价位</small></div>
            </div>
            <div className="legend-row">
              <span className="legend-symbol tank-symbol" />
              <div><strong data-i18n="tank">坦克</strong><small data-i18n="large_order">$50K+ · 大额挂单档</small></div>
            </div>
            <div className="legend-row">
              <span className="legend-symbol aircraft-symbol" />
              <div><strong data-i18n="aircraft">战机</strong><small data-i18n="mega_order">$200K+ · 大额主动成交</small></div>
            </div>
            <div className="legend-row">
              <span className="legend-symbol blast-symbol" />
              <div><strong data-i18n="artillery">炮火</strong><small data-i18n="market_trade">主动成交 · 吃单</small></div>
            </div>
          </div>

          <div className="camera-hint">
            <span><kbd data-i18n="drag">拖拽</kbd> <span data-i18n="rotate">旋转</span></span>
            <span><kbd data-i18n="scroll">滚轮</kbd> <span data-i18n="zoom">缩放</span></span>
            <span><kbd data-i18n="right_click">右键</kbd> <span data-i18n="pan">平移</span></span>
          </div>

          <section className="depth-panel glass-panel" aria-label="订单簿深度" data-i18n-aria="depth_region">
            <header>
              <div><span className="panel-kicker">ORDERBOOK DEPTH</span><strong data-i18n="depth_title">10 档聚合深度</strong></div>
              <span className="sim-badge">CONNECTING</span>
            </header>
            <svg id="depth-chart" viewBox="0 0 460 122" role="img" aria-label="买卖盘深度曲线" data-i18n-aria="depth_chart_aria">
              <defs>
                <linearGradient id="bid-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#35c98a" stopOpacity=".42" /><stop offset="1" stopColor="#35c98a" stopOpacity=".04" /></linearGradient>
                <linearGradient id="ask-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ee214b" stopOpacity=".42" /><stop offset="1" stopColor="#ee214b" stopOpacity=".04" /></linearGradient>
              </defs>
              <path id="bid-area" fill="url(#bid-fill)" stroke="#35c98a" strokeWidth="2" />
              <path id="ask-area" fill="url(#ask-fill)" stroke="#ee214b" strokeWidth="2" />
              <line x1="230" x2="230" y1="10" y2="110" stroke="#16131a" strokeOpacity=".28" strokeDasharray="3 5" />
            </svg>
            <div className="depth-axis"><span id="low-price">--</span><strong id="mid-price">--</strong><span id="high-price">--</span></div>
          </section>

          <section className="feed-panel glass-panel" aria-label="实时战报" data-i18n-aria="feed_region">
            <header>
              <div><span className="panel-kicker">BATTLE FEED</span><strong data-i18n="battle_feed">实时战报</strong></div>
              <span className="live-label"><i /> LIVE</span>
            </header>
            <div className="feed-list" id="feed-list" aria-live="polite" />
          </section>
        </section>

        <footer className="ticker-strip">
          <span className="ticker-title">MARKET SIGNALS</span>
          <div className="ticker-item"><small data-i18n="book_activity">前 10 档挂单数</small><strong id="trade-intensity">--</strong></div>
          <div className="ticker-item"><small data-i18n="spread">价差</small><strong id="spread-value">--</strong></div>
          <div className="ticker-item"><small data-i18n="large_order_ratio">大额挂单档占比</small><strong id="whale-ratio">--</strong></div>
          <div className="ticker-item"><small data-i18n="book_imbalance">买卖失衡</small><strong className="green" id="footer-imbalance">--</strong></div>
          <div className="ticker-disclaimer" data-i18n="disclaimer">XYZ HIP-3 SKHYNIX 永续合约 · 非 KRX 盘口 · 与 SK hynix、Hyperliquid 无官方关联 · 非投资建议</div>
        </footer>
      </main>
    </>
  );
}

const app = document.getElementById('app');
if (!app) throw new Error('Missing #app root element');

const root = createRoot(app);
flushSync(() => root.render(<BattlefieldApp />));

void import('./legacy-entry.js');
