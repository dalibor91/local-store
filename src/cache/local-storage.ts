import type { Entry, Store, StoredRecord, StoredValue, StoreOptions } from "../interfaces";
import { BaseStore } from "./base";

export class LocalStore extends BaseStore implements Store {
    private storage: Storage;
  
    constructor(storage: Storage = localStorage, options?: StoreOptions) {
      super(options);
      this.storage = storage;
    }
  
    private namespaced(key: string) {
      return `${this.prefix}.${this.escapeKey(key)}`;
    }
  
    async load<T = StoredValue>(key: string): Promise<Entry<T>> {
      const raw = this.storage.getItem(this.namespaced(key));
      if (!raw) {
        return { exists: false, expired: false, value: null };
      }
  
      const record: StoredRecord<T> = JSON.parse(raw);
      const expired =
        record.expiresAt !== null && record.expiresAt < Date.now();
  
      return {
        exists: true,
        expired,
        value: expired ? null : record.value,
      };
    }
  
    async fetch<T = StoredValue>(key: string): Promise<T | null> {
      const entry = await this.load<T>(key);
      if (entry.exists && !entry.expired) {return entry.value;}
  
      if (entry.expired) {await this.remove(key);}
      return null;
    }
  
    async store<T = StoredValue>(
      key: string,
      value: T,
      expirationMs?: number | null
    ): Promise<Entry<T>> {
      const record: StoredRecord<T> = {
        value,
        expiresAt:
          expirationMs && expirationMs > 0
            ? Date.now() + expirationMs
            : null,
      };
  
      this.storage.setItem(this.namespaced(key), JSON.stringify(record));
      return this.load<T>(key);
    }
  
    async remove(key: string): Promise<void> {
      this.storage.removeItem(this.namespaced(key));
    }
  }