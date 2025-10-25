import { Redis } from "@upstash/redis"

// 👇 we can now import our redis client anywhere we need it
export const redis = new Redis({
    url: process.env.UPSTASH_KV_REST_API_URL,
    token: process.env.UPSTASH_KV_REST_API_TOKEN,
})