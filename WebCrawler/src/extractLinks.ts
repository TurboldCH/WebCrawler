const cheerio = require("cheerio");

const extractLinks = async (url: string) => {
  const response = await fetch(url);
  const html = await response.text();

  const $ = cheerio.load(html);
  let links = $("a")
    .map((i: any, el: any) => {
      let href: any = $(el).attr("href");
      let newUrl = new URL(href, url);
      return newUrl;
    })
    .toArray()
    .filter(
      (url: { protocol: string }) =>
        url.protocol === "http:" || url.protocol === "https:"
    )
    .map((url: { href: any }) => url.href);
  return links;
};

export { extractLinks };
