import type { OrderbookLevel } from './types';

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const formatPrice = (value: number) => `$${Number(value).toLocaleString('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2
})}`;

export const formatAxisPrice = (value: number) => Number(value).toLocaleString('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2
});

export const formatNotional = (value: number) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

export const formatSize = (value: number) => Number(value).toLocaleString('en-US', { maximumFractionDigits: 3 });

export function depthPath(rows: OrderbookLevel[], side: 'bid' | 'ask') {
  if (!rows.length) return '';
  const isBid = side === 'bid';
  const startX = 230;
  const width = 215;
  const max = Math.max(...rows.map((row) => row.quantity));
  let cumulative = 0;
  const points = rows.map((row, index) => {
    cumulative += row.quantity;
    const x = startX + (isBid ? -1 : 1) * ((index + 1) / rows.length) * width;
    const y = 105 - (cumulative / (max * rows.length * 0.65)) * 82;
    return [x, clamp(y, 16, 104)];
  });
  const line = points.map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  return `M ${startX} 108 ${line} L ${isBid ? 10 : 450} 108 Z`;
}
