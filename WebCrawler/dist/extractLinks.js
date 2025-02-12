const cheerio = require("cheerio");
const extractLinks = async (url) => {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    let links = $("a")
        .map((i, el) => {
        let href = $(el).attr("href");
        let newUrl = new URL(href, url);
        return newUrl;
    })
        .toArray()
        .filter((url) => url.protocol === "http:" || url.protocol === "https:")
        .map((url) => url.href);
    return links;
};
export { extractLinks };
