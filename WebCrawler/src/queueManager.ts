import redis from "./redisClient";

export async function clearQueue() {
  await redis.del(`urlQueue`);
  console.log("Queue is cleared");
}
export async function enqueueUrl(
  url: string,
  depth: number,
) {
  const queueKey = `urlQueue`;
  const alreadyVisited = await isVisited(url);

  if (!alreadyVisited) {
    await redis.lpush(queueKey, JSON.stringify({ url, depth }));
    await redis.expire(queueKey, 3600);
  } else {
    console.log("The URL ", url, " is already visisted");
  }
}
export async function dequeueUrl() {
  const queueKey = `urlQueue`;
  const data = await redis.rpop(queueKey);
  return data ? JSON.parse(data) : null;
}
export async function markVisited(url: string) {
  await redis.sadd("visitedLinks", url);
}
export async function isVisited(url: string) {
  return await redis.sismember("visitedLinks", url);
}
