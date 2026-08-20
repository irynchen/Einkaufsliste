import Dexie, { type Table } from 'dexie';
import {
  type Category,
  type ShoppingList,
  type ShoppingItem,
  type Receipt,
  type Purchase,
  type RecurringRule,
  type Budget,
  DEFAULT_CATEGORIES,
} from '../types/models';

class EinkaufslisteDB extends Dexie {
  categories!: Table<Category, string>;
  lists!: Table<ShoppingList, string>;
  items!: Table<ShoppingItem, string>;
  receipts!: Table<Receipt, string>;
  purchases!: Table<Purchase, string>;
  recurringRules!: Table<RecurringRule, string>;
  budgets!: Table<Budget, string>;

  constructor() {
    super('einkaufsliste-db');
    this.version(1).stores({
      categories: 'id, order',
      lists: 'id, createdAt, archived',
      items: 'id, listId, categoryId, checked, recurringRuleId',
      receipts: 'id, purchaseId',
      purchases: 'id, listId, date',
      recurringRules: 'id, listId, active',
      budgets: 'id, listId',
    });
  }
}

export const db = new EinkaufslisteDB();

export async function seedDefaults() {
  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES);
  }

  const listCount = await db.lists.count();
  if (listCount === 0) {
    await db.lists.add({
      id: crypto.randomUUID(),
      name: 'Wocheneinkauf',
      color: '#34C759',
      icon: '🛒',
      createdAt: Date.now(),
    });
  }
}
