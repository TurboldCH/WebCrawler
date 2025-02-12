import { extractLinks } from "./extractLinks.js";
import {
  enqueueUrl,
  dequeueUrl,
  markVisited,
  isVisited,
} from "./queueManager.js";

const MAXDEPTH = 2;

async function fetchWithTimeout(url: string, timeout: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function crawlLinks(baseUrl: string, depth: number) {
  if (depth > MAXDEPTH || (await isVisited(baseUrl))) {
    return;
  }
  await markVisited(baseUrl);

  console.log(`Crawling: ${baseUrl}, at depth ${depth}`);

  try {
    const response = await fetchWithTimeout(baseUrl, 5000);
    if (!response.ok) {
      console.log(`Broken link: ${baseUrl}, Status: ${response.status}`);
      return;
    }
    let children = await extractLinks(baseUrl);
    let baseDomain = new URL(baseUrl).hostname;
    for (let child of children) {
      let childDomain = new URL(child).hostname;
      if (baseDomain === childDomain) {
        await enqueueUrl(child, depth + 1);
      } else {
        // console.log(`Skipping external link: ${child}`);
      }
    }
  } catch (err: any) {
    console.log(`Failed to crawl ${baseUrl}:`, err.message);
  }
}

export async function crawl() {
  console.log("Crawling starting...");
  while (true) {
    const task = await dequeueUrl();
    if (task == null) {
      console.log(`Queue empty for session`);
      break;
    }
    const { url, depth } = task;
    await crawlLinks(url, depth);
  }
}
