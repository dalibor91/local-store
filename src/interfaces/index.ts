/* eslint-disable @typescript-eslint/no-explicit-any */
export type StoredValue = any;

export interface StoredRecord<T = StoredValue> {
    value: T;
    expiresAt: number | null;
}

export interface Entry<T = StoredValue> {
    exists: boolean;
    expired: boolean;
    value: T | null;
}

export interface Store {
    load<T = StoredValue>(key: string): Promise<Entry<T>>;
    fetch<T = StoredValue>(key: string): Promise<T | null>;
    store<T = StoredValue>(
        key: string,
        value: T,
        expirationMs?: number | null
    ): Promise<Entry<T>>;
    remove(key: string): Promise<void>;
}

export interface StoreOptions {
    prefix?: string;
    debug?: boolean;
}