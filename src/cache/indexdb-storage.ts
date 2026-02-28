import type { Entry, Store, StoredRecord,StoredValue,StoreOptions } from "../interfaces";
import { BaseStore } from "./base";

export class IndexDbStore extends BaseStore implements Store {
    private storeName = "kv";
    private dbPromise: Promise<IDBDatabase>;
  
    constructor(options?: StoreOptions) {
      super(options);
      this.dbPromise = this.openDB();
    }
  
    private openDB(): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.prefix, 1);
  
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
          }
        };
  
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  
    private async getRaw<T>(key: string): Promise<StoredRecord<T> | null> {
      const db = await this.dbPromise;
  
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readonly");
        const store = tx.objectStore(this.storeName);
        const req = store.get(this.escapeKey(key));
  
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    }
  
    private async putRaw<T>(key: string, record: StoredRecord<T>) {
      const db = await this.dbPromise;
  
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        const req = store.put(record, this.escapeKey(key));
  
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
  
    async load<T = StoredValue>(key: string): Promise<Entry<T>> {
      const record = await this.getRaw<T>(key);
  
      if (!record) {
        return { exists: false, expired: false, value: null };
      }
  
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
  
      await this.putRaw(key, record);
      return this.load<T>(key);
    }
  
    async remove(key: string): Promise<void> {
      const db = await this.dbPromise;
  
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, "readwrite");
        const store = tx.objectStore(this.storeName);
        store.delete(this.escapeKey(key));
  
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  }