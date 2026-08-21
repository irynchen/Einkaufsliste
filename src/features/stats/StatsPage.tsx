import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { db } from '../../db/db';
import { formatCurrency } from '../../utils/format';
import { vividGradient } from '../../utils/color';
import {
  periodRange,
  categoryTotals,
  bucketTotals,
  topItems,
  storePriceComparison,
  type PeriodPreset,
} from '../../utils/stats';

const PRESETS: { key: PeriodPreset; label: string }[] = [
  { key: '7d', label: '7 Tage' },
  { key: '30d', label: 'Monat' },
  { key: '1y', label: 'Jahr' },
  { key: 'custom', label: 'Individuell' },
];

export default function StatsPage() {
  const lists = useLiveQuery(() => db.lists.toArray(), []) ?? [];
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const [scope, setScope] = useState<'all' | string>('all');
  const [preset, setPreset] = useState<PeriodPreset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { from, to } = periodRange(
    preset,
    customFrom ? new Date(customFrom).getTime() : undefined,
    customTo ? new Date(customTo).getTime() + 86399999 : undefined,
  );

  const purchases =
    useLiveQuery(async () => {
      const all = await db.purchases.where('date').between(from, to, true, true).toArray();
      return scope === 'all' ? all : all.filter((p) => p.listId === scope);
    }, [from, to, scope]) ?? [];

  const allPurchasesForBudgetHistory =
    useLiveQuery(async () => {
      const all = await db.purchases.toArray();
      return scope === 'all' ? all : all.filter((p) => p.listId === scope);
    }, [scope]) ?? [];

  const budgets = useLiveQuery(() => db.budgets.toArray(), []) ?? [];
  const budget = budgets.find((b) => b.listId === scope) ?? budgets.find((b) => b.listId === 'global');

  const catTotals = useMemo(() => categoryTotals(purchases), [purchases]);
  const totalSpent = catTotals.reduce((s, c) => s + c.total, 0);
  const granularity = preset === '1y' ? 'month' : 'week';
  const buckets = useMemo(() => bucketTotals(purchases, granularity), [purchases, granularity]);
  const { mostFrequent, mostExpensive } = useMemo(() => topItems(purchases), [purchases]);
  const priceComparison = useMemo(
    () => storePriceComparison(allPurchasesForBudgetHistory),
    [allPurchasesForBudgetHistory],
  );

  const monthlyBudgetHistory = useMemo(() => {
    if (!budget) return [];
    const byMonth = new Map<string, { label: string; total: number; sortKey: number }>();
    for (const p of allPurchasesForBudgetHistory) {
      const d = new Date(p.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = new Intl.DateTimeFormat('de-DE', { month: 'short', year: '2-digit' }).format(d);
      const existing = byMonth.get(key);
      if (existing) existing.total += p.totalAmount;
      else byMonth.set(key, { label, total: p.totalAmount, sortKey: new Date(d.getFullYear(), d.getMonth(), 1).getTime() });
    }
    return Array.from(byMonth.values())
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(-6)
      .map((m) => ({ ...m, limit: budget.monthlyLimit, exceeded: m.total > budget.monthlyLimit }));
  }, [allPurchasesForBudgetHistory, budget]);

  const categoryColor = (id: string) => categories.find((c) => c.id === id)?.color ?? '#8E8E93';
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="flex flex-col gap-4 px-4 pt-3 pb-10">
      <div className="flex gap-2 overflow-x-auto">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-[#1c1c1e]"
        >
          <option value="all">Alle Listen</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.icon} {l.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all ${
              preset === p.key ? 'text-white shadow-sm' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
            style={preset === p.key ? { backgroundImage: vividGradient('#34C759') } : undefined}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="flex gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-[#1c1c1e]"
          />
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-[#1c1c1e]"
          />
        </div>
      )}

      <div
        className="rounded-2xl p-4 text-white shadow-lg"
        style={{ backgroundImage: 'linear-gradient(135deg, #46E37F 0%, #34C759 55%, #17A83E 100%)' }}
      >
        <p className="text-sm font-medium text-white/85">Gesamtausgaben im Zeitraum</p>
        <p className="text-3xl font-extrabold tracking-tight">{formatCurrency(totalSpent)}</p>
      </div>

      {catTotals.length > 0 && (
        <div className="glass rounded-2xl p-4 shadow-sm">
          <p className="mb-2 font-semibold">Ausgaben pro Kategorie</p>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={catTotals} dataKey="total" nameKey="categoryId" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {catTotals.map((c) => (
                    <Cell key={c.categoryId} fill={categoryColor(c.categoryId)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, _n, entry) => [
                    formatCurrency(Number(v)),
                    categoryName(String(entry.payload.categoryId)),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-col gap-1.5">
            {catTotals
              .sort((a, b) => b.total - a.total)
              .map((c) => (
                <li key={c.categoryId} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColor(c.categoryId) }} />
                  <span className="flex-1">{categoryName(c.categoryId)}</span>
                  <span className="font-medium">{formatCurrency(c.total)}</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {buckets.length > 0 && (
        <div className="glass rounded-2xl p-4 shadow-sm">
          <p className="mb-2 font-semibold">Verlauf der Ausgaben</p>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={buckets}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} width={40} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Line type="monotone" dataKey="total" stroke="#34C759" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {(mostFrequent.length > 0 || mostExpensive.length > 0) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="glass rounded-2xl p-4 shadow-sm">
            <p className="mb-2 font-semibold">Häufigste Artikel</p>
            <ol className="flex flex-col gap-1.5 text-sm">
              {mostFrequent.map((i) => (
                <li key={i.name} className="flex justify-between">
                  <span className="truncate">{i.name}</span>
                  <span className="text-gray-400">{i.count}×</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="glass rounded-2xl p-4 shadow-sm">
            <p className="mb-2 font-semibold">Teuerste Artikel</p>
            <ol className="flex flex-col gap-1.5 text-sm">
              {mostExpensive.map((i) => (
                <li key={i.name} className="flex justify-between">
                  <span className="truncate">{i.name}</span>
                  <span className="font-medium">{formatCurrency(i.total)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {priceComparison.length > 0 && (
        <div className="glass rounded-2xl p-4 shadow-sm">
          <p className="mb-2 font-semibold">Preisvergleich nach Geschäft</p>
          <p className="mb-3 text-xs text-gray-400">
            Artikel, die du in mehreren Geschäften gekauft hast – günstigste Option zuerst.
          </p>
          <ul className="flex flex-col gap-3">
            {priceComparison.slice(0, 8).map((c) => (
              <li key={`${c.name}__${c.unit}`} className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-medium">{c.name}</span>
                  {c.savingsPct > 0 && (
                    <span className="rounded-full bg-ios-green/15 px-2 py-0.5 text-xs font-semibold text-ios-green">
                      bis zu {c.savingsPct.toFixed(0)}% sparen
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  {c.entries.map((e) => (
                    <div key={e.store} className="flex items-center justify-between text-sm">
                      <span
                        className={
                          e.store === c.cheapest.store
                            ? 'font-medium text-ios-green'
                            : 'text-gray-500 dark:text-gray-400'
                        }
                      >
                        {e.store === c.cheapest.store && '✓ '}
                        {e.store}
                      </span>
                      <span className={e.store === c.cheapest.store ? 'font-semibold text-ios-green' : 'text-gray-500 dark:text-gray-400'}>
                        {formatCurrency(e.price)} / {c.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {monthlyBudgetHistory.length > 0 && (
        <div className="glass rounded-2xl p-4 shadow-sm">
          <p className="mb-2 font-semibold">Budget-Verlauf</p>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyBudgetHistory}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} width={40} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {monthlyBudgetHistory.map((m, idx) => (
                    <Cell key={idx} fill={m.exceeded ? '#FF3B30' : '#34C759'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {purchases.length === 0 && (
        <p className="pt-10 text-center text-sm text-gray-400">Keine Einkäufe im gewählten Zeitraum.</p>
      )}
    </div>
  );
}
