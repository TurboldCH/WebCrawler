import { extractLinks } from "./extractLinks.js";
import Redis from "ioredis";
const MAXDEPTH = 2;
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});
redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});
redis.on("error", (err) => {
  console.log("Redis Connection error:", err);
});
async function enqueueUrl(url, depth) {
  await redis.lpush("urlQueue", JSON.stringify({ url, depth }));
}
async function dequeueUrl() {
  const data = await redis.rpop("urlQueue");
  return data ? JSON.parse(data) : null;
}
async function markVisited(url) {
  await redis.sadd("visitedLinks", url);
}
async function isVisited(url) {
  return await redis.sismember("visitedLinks", url);
}

const fetchWithTimeout = async (url, timeout) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
  
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  };
const crawlLinks = async (baseUrl, depth) => {
  if (depth > MAXDEPTH || (await isVisited(baseUrl))) {
    return;
  }
  await markVisited(baseUrl);
  
  console.log(`Crawling: ${baseUrl}, at depth ${depth}`);
  try {
    let children = await extractLinks(baseUrl);
    let baseDomain = new URL(baseUrl).hostname;
    for (let child of children) {
      let childDomain = new URL(child).hostname;
      if (childDomain === baseDomain) {
        await enqueueUrl(child, depth + 1);
      } else {
        console.log(`Skipping external link: ${child}`);
      }
    }
  } catch (err) {
    console.log(`Failed to crawl ${baseUrl}:`, err.message);
  }
};
async function crawl() {
  while (true) {
    const task = await dequeueUrl();
    if (!task) {
      continue;
    }
    const { url, depth } = task;
    await crawlLinks(url, depth);
  }
}
await enqueueUrl("https://www.apple.com/", 0);
crawl();
