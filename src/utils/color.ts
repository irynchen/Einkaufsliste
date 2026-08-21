function clamp(n: number): number {
  return Math.min(255, Math.max(0, n));
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clamp(Math.round(v)).toString(16).padStart(2, '0')).join('')}`;
}

export function shade(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  return rgbToHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
}

/** Lebendiger Diagonal-Gradient auf Basis einer Kategorie-/Listenfarbe. */
export function vividGradient(hex: string, angle = 135): string {
  return `linear-gradient(${angle}deg, ${shade(hex, 0.28)} 0%, ${hex} 55%, ${shade(hex, -0.18)} 100%)`;
}

export function softTint(hex: string, opacity = 0.14): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
