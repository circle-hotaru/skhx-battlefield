# SKHYNIX Orderbook Battlefield

把 Hyperliquid 上显示为 `xyz:SKHYNIX` 的 SK hynix 永续合约实时订单簿映射成可交互的 3D 战场。它在 Hyperliquid API 和 WebSocket 中的底层市场标识是 `xyz:SKHX`。

- 买盘为绿色军队，卖盘为红色军队；挂单方向不等同于开多或开空。
- 小额挂单价位映射为步兵，聚合名义金额达到 `$50,000` 的挂单档映射为坦克。
- 实时主动成交映射为炮火，成交方向决定炮弹方向。
- 可选 Web Audio 战场音效：普通成交为轻型射击，大额成交为重炮，落点触发爆炸声。
- 十档订单簿的名义金额失衡决定阵线位置和行军速度。
- 数据直接来自 Hyperliquid 主网，不使用模拟行情，不需要 API Key。
- 支持中文、英文和韩文界面，语言选择保存在浏览器中，刷新后继续生效。

> `xyz:SKHYNIX` 是 Hyperliquid 前端显示名，`xyz:SKHX` 是同一市场的 API 标识，不是两个订单簿。该合约由 XYZ 通过 HIP-3 部署，追踪 KRX `000660` 一股普通股的美元价值；订单簿来自 Hyperliquid 合约市场，并不是韩国交易所真实盘口。

## 运行

```bash
pnpm install
pnpm dev
```

生产构建：

```bash
pnpm build
pnpm preview
```

## 实时数据接入

数据适配器位于 `src/main.js` 的 `HyperliquidOrderbookAdapter`。页面连接：

```text
wss://api.hyperliquid.xyz/ws
```

建立连接后订阅三个公开频道：

```json
{"method":"subscribe","subscription":{"type":"l2Book","coin":"xyz:SKHX"}}
{"method":"subscribe","subscription":{"type":"trades","coin":"xyz:SKHX"}}
{"method":"subscribe","subscription":{"type":"activeAssetCtx","coin":"xyz:SKHX"}}
```

另外通过 `POST https://api.hyperliquid.xyz/info` 的 `metaAndAssetCtxs` 请求初始化前收盘价、标记价格、预言机价格和资金费率。该请求失败不会影响实时订单簿连接。

适配器包含：

- 100ms UI 更新节流，避免高频订单簿拖慢 3D 渲染。
- 30 秒 WebSocket 心跳。
- 指数退避自动重连，最长等待 10 秒。
- 明确的连接、在线与重连状态；断线时不会生成假数据。
- 订单簿固定取前十档，保留每档价格、SKHX 数量和订单数。

## 音效

音效由浏览器 Web Audio API 实时合成，不需要下载音频素材。浏览器禁止页面自动播放声音，因此初始状态为静音，点击右上角 `♪` 后才会创建并启动音频上下文。普通成交、大额成交和炮弹落点使用不同音色，并设置了触发节流，避免高频成交造成声音堆叠。

## 多语言

首次访问会根据浏览器语言偏好自动选择中文、英文或韩文；无法匹配时使用英文。点击右上角语言按钮，可在 `中文 → English → 한국어` 间循环切换。翻译覆盖静态面板、实时连接状态、市场压力、战报、音效提示和移动端辅助文本。手动选择通过 `localStorage` 的 `skhx-language` 保存，之后优先于浏览器语言；翻译字典位于 `src/main.js` 的 `translations`。

## 数据映射

| Hyperliquid 数据                   | 战场表达                                 |
| ---------------------------------- | ---------------------------------------- |
| `levels[0]` 买盘                   | 绿色买盘军队                             |
| `levels[1]` 卖盘                   | 红色卖盘军队                             |
| 单个价位的 `px × sz` 较小          | 步兵                                     |
| 单个聚合价位的 `px × sz ≥ $50,000` | 坦克/大额挂单档                          |
| `n`                                | 同价位订单数量；页脚展示前十档订单数之和 |
| `trades.side = B`                  | 绿色炮火向卖方发射                       |
| `trades.side = A`                  | 红色炮火向买方发射                       |
| 十档买卖名义金额失衡               | 阵线偏移和推进速度                       |

“步兵”和“坦克”只表示聚合挂单价位的规模，不代表单笔订单，也不代表真实散户或机构身份。

本项目仅用于数据可视化演示，不构成投资建议。
