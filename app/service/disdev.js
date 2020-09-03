const Service = require("egg").Service;
const cheerio = require("cheerio");

/**
 * DiscoverDev
 * https://www.discoverdev.io/archive
 */
class DisdevService extends Service {
  async _savePost({ title, url }) {
    const { ctx, service } = this;
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data, { decodeEntities: false });
    const html = $(".archive-list").html();
    const date = $(".archive-page h1.heading").text().replace("Archive | ", "");
    const markdown = ctx.helper.html2md(html);
    const post = {
      url,
      title,
      timestamp: +new Date(date),
      from: "DiscoverDev",
      content: markdown,
      wordCount: markdown.length,
      readCount: 0,
      likeCount: 0,
      dislikeCount: 0,
    };
    if (!post.content) {
      return;
    }
    const existed = await service.post.findOne({ where: { url } });
    if (existed) {
      await service.post.update(post, { where: { url } });
    } else {
      await service.post.create(post);
    }
  }

  async _fetchPostList() {
    const { ctx } = this;
    const url = "https://www.discoverdev.io/archive";
    const list = [];
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data);
    $(".archive-list li")
      .get()
      .map((item) => {
        list.push({
          title: "DiscoverDev | " + $(item).find("a").text().trim(),
          url: "https://www.discoverdev.io" + $(item).find("a").attr("href"),
        });
      });
    return list;
  }

  async refresh(jumpExisted) {
    const { ctx, service } = this;
    const list = await this._fetchPostList();
    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      const existed = await service.post.findOne({ where: { url: item.url } });
      if (existed && jumpExisted) {
        console.log(`👌 (${i + 1}/${list.length}) ${item.url}`);
        continue;
      }
      try {
        await this._savePost(item);
        console.log(`✅ (${i + 1}/${list.length}) ${item.url}`);
      } catch (e) {
        console.log(`❌ (${i + 1}/${list.length}) ${item.url}`);
        ctx.logger.error("Error while DisdevService.refresh, stack: ", e);
      }
    }
  }
}

module.exports = DisdevService;
