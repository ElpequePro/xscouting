import { redis } from "@/lib/redis"

// 👇 server component
const Page = async () => {
    const count = await redis.get<number>("count")
    return <p>count: {count}</p>
}

export default Page