// Zentrale Datenmodelle der Einkaufslisten-App

export type CategoryId = string;
export type ListId = string;
export type ItemId = string;
export type PurchaseId = string;
export type ReceiptId = string;
export type RecurringRuleId = string;
export type BudgetId = string;

/** Globale Kategorie, wiederverwendbar über alle Listen hinweg */
export interface Category {
  id: CategoryId;
  name: string;
  icon: string; // Emoji oder Icon-Key
  color: string; // Tailwind-kompatible Hex-Farbe
  order: number;
  isDefault?: boolean;
}

/** Eine eigenständige Einkaufsliste (z.B. "Wocheneinkauf", "Drogerie") */
export interface ShoppingList {
  id: ListId;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
  archived?: boolean;
}

export type RecurrenceInterval = 'weekly' | 'biweekly' | 'monthly';

/** Regel für wiederkehrende Artikel */
export interface RecurringRule {
  id: RecurringRuleId;
  itemName: string;
  categoryId: CategoryId;
  listId: ListId;
  quantity: number;
  unit: string;
  interval: RecurrenceInterval;
  lastAddedAt?: number; // Zeitpunkt, wann zuletzt zu einer Liste hinzugefügt
  active: boolean;
}

/** Ein Artikel innerhalb einer Einkaufsliste */
export interface ShoppingItem {
  id: ItemId;
  listId: ListId;
  name: string;
  quantity: number;
  unit: string;
  categoryId: CategoryId;
  checked: boolean;
  price?: number; // geschätzter oder tatsächlicher Preis
  recurringRuleId?: RecurringRuleId;
  barcode?: string;
  createdAt: number;
  checkedAt?: number;
}

/** Lokal gelernte Zuordnung Barcode -> Artikeldaten (aus vorherigen Scans) */
export interface BarcodeEntry {
  barcode: string;
  name: string;
  categoryId: CategoryId;
  unit: string;
}

/** Foto eines Kassenbons, einem Einkauf zugeordnet */
export interface Receipt {
  id: ReceiptId;
  purchaseId: PurchaseId;
  blob: Blob;
  createdAt: number;
}

/** Abgeschlossener Einkauf (Historie), erzeugt beim Abschließen einer Liste */
export interface Purchase {
  id: PurchaseId;
  listId: ListId;
  listName: string;
  date: number;
  totalAmount: number;
  store?: string;
  items: PurchasedItem[];
}

export interface PurchasedItem {
  name: string;
  quantity: number;
  unit: string;
  categoryId: CategoryId;
  price: number;
  barcode?: string;
}

/** Budget - global oder pro Liste, optional pro Kategorie aufgeschlüsselt */
export interface Budget {
  id: BudgetId;
  listId: ListId | 'global';
  monthlyLimit: number;
  categoryLimits: Partial<Record<CategoryId, number>>;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'obst-gemuese', name: 'Obst & Gemüse', icon: '🥦', color: '#34C759', order: 0, isDefault: true },
  { id: 'milchprodukte', name: 'Milchprodukte', icon: '🥛', color: '#5AC8FA', order: 1, isDefault: true },
  { id: 'fleisch-fisch', name: 'Fleisch & Fisch', icon: '🥩', color: '#FF3B30', order: 2, isDefault: true },
  { id: 'getraenke', name: 'Getränke', icon: '🥤', color: '#FF9500', order: 3, isDefault: true },
  { id: 'haushalt', name: 'Haushalt', icon: '🧴', color: '#AF52DE', order: 4, isDefault: true },
  { id: 'sonstiges', name: 'Sonstiges', icon: '🛒', color: '#8E8E93', order: 5, isDefault: true },
];

export const UNITS = ['Stück', 'kg', 'g', 'L', 'ml', 'Packung', 'Dose', 'Flasche'];
