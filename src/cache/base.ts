import type { StoreOptions } from "../interfaces";

export abstract class BaseStore {
    protected prefix: string;
    protected debug: boolean;

    constructor(options?: StoreOptions) {
        this.prefix = options?.prefix ?? "cache";
        this.debug = options?.debug ?? false;
    }

    protected log(...args: unknown[]) {
        if (this.debug) {
            // eslint-disable-next-line no-console
            console.log("[@dalibor91/local-store]", ...args);
        }
    }

    protected escapeKey(name: string): string {
        return name.replace(/[^0-9a-z-_.]/gi, "-");
    }

    protected dataKey(name: string): string {
        return `${this.prefix}.${this.escapeKey(name)}`;
    }

    protected expirationKey(name: string): string {
        return `${this.dataKey(name)}._expr`;
    }
}