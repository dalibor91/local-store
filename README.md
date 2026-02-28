# @dalibor91/local-store

A small browser-oriented library for key–value caching with optional expiration. It offers two backends: **LocalStore** (Storage API: `localStorage` or custom) and **IndexDbStore** (IndexedDB), both with the same async API.

## What it does

- **LocalStore** – Uses the Storage API (`localStorage` by default, or any object with `getItem` / `setItem` / `removeItem`). Good for smaller data and simple key–value needs.
- **IndexDbStore** – Uses IndexedDB. Better for larger or structured data and when you need a real database in the browser.

Both support:

- **Prefix** – All keys are namespaced under a configurable prefix to avoid clashes.
- **Optional TTL** – `store(key, value, expirationMs)` so entries can expire automatically.
- **Unified API** – `load`, `fetch`, `store`, `remove` with consistent return shapes.

Values are JSON-serialized; expiration is stored with each record and checked on read.

## Install

```bash
npm install @dalibor91/local-store
```

## Use

### LocalStore (localStorage)

```js
import { LocalStore } from "@dalibor91/local-store";

// Default: uses localStorage with prefix "cache"
const store = new LocalStore({ prefix: "foo" });

// Optional: custom prefix and storage
const custom = new LocalStore(sessionStorage, { prefix: "my-app" });

// Store a value (optionally with TTL in milliseconds)
await store.store("user", { id: 1, name: "Alice" });
await store.store("token", "abc123", 60 * 60 * 1000); // expires in 1 hour

// Load: returns raw record { exists, expired, value }
const entry = await store.load("user");
if (entry.exists && !entry.expired) {
  console.log(entry.value);
}

// Fetch: returns value or null (and removes if expired)
const token = await store.fetch("token");

// Remove
await store.remove("user");
```

### IndexDbStore (IndexedDB)

```js
import { IndexDbStore } from "@dalibor91/local-store";

// prefix is used as the IndexedDB database name
const store = new IndexDbStore({ prefix: "my-app" });

await store.store("data", { large: "object" });
const entry = await store.load("data");
const value = await store.fetch("data");
await store.remove("data");
```

### API summary

| Method            | Returns              | Description                                      |
| ----------------- | -------------------- | ------------------------------------------------ |
| `load(key)`       | `Promise<Entry<T>>`  | `{ exists, expired, value }`; does not remove.   |
| `fetch(key)`      | `Promise<T \| null>` | Value if present and not expired; removes if expired. |
| `store(key, value, expirationMs?)` | `Promise<Entry<T>>` | Writes (and overwrites) a key; optional TTL.     |
| `remove(key)`     | `Promise<void>`      | Deletes the key.                                 |

Constructor options (both stores):

- **prefix** – Key/database namespace (default: `"cache"`).
- **debug** – Enable debug logging (default: `false`).
