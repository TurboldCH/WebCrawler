import Redis from "ioredis";

const redis = new Redis(
  "rediss://default:AStaAAIjcDE5MThhYjQzZGU4NjU0MWEwYjAzZTBiZjRiZjkyODQwNHAxMA@blessed-oarfish-11098.upstash.io:6379"
);

redis.on("error", (err) => {
  console.log("Redis Connection error:", err);
});

export default redis;
