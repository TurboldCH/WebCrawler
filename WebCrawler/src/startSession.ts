import { crawl } from "./crawlLinks";
import { clearQueue, enqueueUrl, isVisited } from "./queueManager";

async function startSession() {
  const startUrl = "https://pinecone.academy";

  if (!(await isVisited(startUrl))) {
    await clearQueue();
  }
  await enqueueUrl(startUrl, 0);
  await crawl();
}

startSession();

//Clear queue if the seed is not finished processing
// If new seed clear the current queue then start processing
