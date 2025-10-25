import { redis } from "@/lib/redis"

export const POST = async () => {
    await redis.incr("count")

    return new Response("OK")
}