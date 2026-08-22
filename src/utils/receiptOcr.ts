import { createWorker } from 'tesseract.js';

export interface ReceiptLine {
  text: string;
  price: number;
}

export interface ReceiptScanResult {
  store: string | null;
  total: number | null;
  lines: ReceiptLine[];
  rawText: string;
}

const NOISE_KEYWORDS = [
  'summe', 'gesamt', 'total', 'zwischensumme', 'mwst', 'ust', 'steuer',
  'gegeben', 'rückgeld', 'ruckgeld', 'bar', 'ec-cash', 'ec cash', 'kartenzahlung',
  'kassenbon', 'beleg', 'bon-nr', 'tel', 'uhr', 'kunde', 'danke', 'trans-nr',
];

const PRICE_AT_END = /(-?\d{1,4}[.,]\d{2})\s*(?:€|eur)?\s*$/i;
const TOTAL_LINE = /(summe|gesamt|total)\b/i;

function parsePrice(raw: string): number {
  return parseFloat(raw.replace('.', '').replace(',', '.')) || parseFloat(raw.replace(',', '.')) || 0;
}

/** Extrahiert Geschäftsname, Gesamtsumme und mögliche Artikel-Preiszeilen aus OCR-Rohtext. */
export function parseReceiptText(rawText: string): ReceiptScanResult {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const store = lines.length > 0 ? lines[0].replace(/[^\p{L}\p{N}\s&.'-]/gu, '').trim() || null : null;

  let total: number | null = null;
  const itemLines: ReceiptLine[] = [];

  for (const line of lines) {
    const match = line.match(PRICE_AT_END);
    if (!match) continue;
    const price = parsePrice(match[1]);
    if (price <= 0) continue;

    const label = line.slice(0, match.index).trim();
    const lower = label.toLowerCase();

    if (TOTAL_LINE.test(lower)) {
      total = price;
      continue;
    }
    if (NOISE_KEYWORDS.some((k) => lower.includes(k)) || label.length < 2) continue;

    itemLines.push({ text: label, price });
  }

  return { store, total, lines: itemLines, rawText };
}

let workerPromise: ReturnType<typeof createWorker> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('deu');
  }
  return workerPromise;
}

export async function scanReceiptImage(file: Blob): Promise<ReceiptScanResult> {
  const worker = await getWorker();
  const {
    data: { text },
  } = await worker.recognize(file);
  return parseReceiptText(text);
}

function normalizeWords(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((w) => w.length >= 3);
}

function wordOverlapScore(a: string[], b: string[]): number {
  let score = 0;
  for (const wa of a) {
    for (const wb of b) {
      if (wa === wb || wa.startsWith(wb) || wb.startsWith(wa)) {
        score += 1;
        break;
      }
    }
  }
  return score;
}

/** Ordnet Artikelnamen den erkannten Kassenbon-Zeilen per Wort-Überlappung zu (bester Treffer je Zeile, eindeutig). */
export function matchReceiptLines<T extends { id: string; name: string }>(
  items: T[],
  lines: ReceiptLine[],
): Record<string, number> {
  const candidates: { itemId: string; lineIdx: number; score: number }[] = [];
  const itemWords = items.map((i) => ({ id: i.id, words: normalizeWords(i.name) }));
  const lineWords = lines.map((l) => normalizeWords(l.text));

  itemWords.forEach(({ id, words }) => {
    lineWords.forEach((lw, lineIdx) => {
      const score = wordOverlapScore(words, lw);
      if (score > 0) candidates.push({ itemId: id, lineIdx, score });
    });
  });

  candidates.sort((a, b) => b.score - a.score);

  const usedItems = new Set<string>();
  const usedLines = new Set<number>();
  const result: Record<string, number> = {};

  for (const c of candidates) {
    if (usedItems.has(c.itemId) || usedLines.has(c.lineIdx)) continue;
    result[c.itemId] = lines[c.lineIdx].price;
    usedItems.add(c.itemId);
    usedLines.add(c.lineIdx);
  }

  return result;
}
