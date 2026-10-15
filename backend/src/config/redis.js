const { createClient } = require('redis');
require("dotenv").config();

class InMemoryRedis {
    constructor() {
        this.store = new Map();
        this.expirations = new Map();
        this.isReady = true;
    }

    async connect() {
        console.log("[Redis] Running in-memory cache fallback (no external Redis connected)");
        return true;
    }

    async exists(key) {
        this._cleanup(key);
        return this.store.has(key) ? 1 : 0;
    }

    async get(key) {
        this._cleanup(key);
        return this.store.get(key) || null;
    }

    async set(key, value, options = {}) {
        if (options && options.NX && (await this.exists(key))) {
            return null;
        }
        this.store.set(key, value);
        if (options && options.EX) {
            this.expirations.set(key, Date.now() + options.EX * 1000);
        }
        return "OK";
    }

    async expireAt(key, timestampInSeconds) {
        this.expirations.set(key, timestampInSeconds * 1000);
        return 1;
    }

    async del(key) {
        this.expirations.delete(key);
        return this.store.delete(key) ? 1 : 0;
    }

    _cleanup(key) {
        const exp = this.expirations.get(key);
        if (exp && Date.now() > exp) {
            this.store.delete(key);
            this.expirations.delete(key);
        }
    }

    on() {
        return this;
    }
}

const inMemoryFallback = new InMemoryRedis();
let redisClient;

// Only attempt real redis if REDIS_URL or (REDIS_HOST and REDISPASS) are set
const hasRedisConfig = process.env.REDIS_URL || (process.env.REDIS_HOST && process.env.REDISPASS);

if (hasRedisConfig) {
    try {
        const clientOptions = process.env.REDIS_URL 
            ? { url: process.env.REDIS_URL }
            : {
                username: process.env.REDIS_USER || 'default',
                password: process.env.REDISPASS,
                socket: {
                    host: process.env.REDIS_HOST,
                    port: Number(process.env.REDIS_PORT) || 18771,
                    connectTimeout: 5000
                }
            };

        const realClient = createClient(clientOptions);
        let isUsingFallback = false;

        realClient.on('error', (err) => {
            if (!isUsingFallback) {
                console.warn('[Redis] Connection warning, using fallback store:', err.message);
                isUsingFallback = true;
            }
        });

        redisClient = {
            async connect() {
                try {
                    await realClient.connect();
                    console.log("[Redis] Connected successfully to Redis server");
                } catch (err) {
                    isUsingFallback = true;
                    console.warn("[Redis] Could not connect to remote Redis. Switched to in-memory fallback:", err.message);
                }
            },
            async exists(key) {
                if (isUsingFallback || !realClient.isReady) return inMemoryFallback.exists(key);
                try { return await realClient.exists(key); } catch { return inMemoryFallback.exists(key); }
            },
            async get(key) {
                if (isUsingFallback || !realClient.isReady) return inMemoryFallback.get(key);
                try { return await realClient.get(key); } catch { return inMemoryFallback.get(key); }
            },
            async set(key, value, options) {
                if (isUsingFallback || !realClient.isReady) return inMemoryFallback.set(key, value, options);
                try { return await realClient.set(key, value, options); } catch { return inMemoryFallback.set(key, value, options); }
            },
            async expireAt(key, timestamp) {
                if (isUsingFallback || !realClient.isReady) return inMemoryFallback.expireAt(key, timestamp);
                try { return await realClient.expireAt(key, timestamp); } catch { return inMemoryFallback.expireAt(key, timestamp); }
            },
            async del(key) {
                if (isUsingFallback || !realClient.isReady) return inMemoryFallback.del(key);
                try { return await realClient.del(key); } catch { return inMemoryFallback.del(key); }
            }
        };
    } catch (e) {
        console.warn("[Redis] Error setting up Redis client, defaulting to in-memory:", e.message);
        redisClient = inMemoryFallback;
    }
} else {
    redisClient = inMemoryFallback;
}

module.exports = redisClient;