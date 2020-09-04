const Service = require("egg").Service;
const cheerio = require("cheerio");

/**
 * CSS Weekly
 * https://css-weekly.com/archives/
 */
class CssWeeklyService extends Service {
  async _savePost({ url, title, date }) {
    const { ctx, service } = this;
    const res = await ctx.curl(url, { type: "GET", dataType: "text" });
    const $ = cheerio.load(res.data, { decodeEntities: false });
    const html = $(".newsletter-web").html();
    const markdown = ctx.helper.html2md(html);
    const post = {
      url,
      title,
      timestamp: +new Date(date),
      from: "CSS Weekly",
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
    const url = "https://css-weekly.com/archives/";
    const list = [];
    const res = await ctx.curl(url, { type: "GET", dataType: "text" });
    const $ = cheerio.load(res.data);
    $(".archives-list article")
      .get()
      .map((item) => {
        list.push({
          url: $(item).find("h3.title a").attr("href"),
          title: "CSS Weekly " + $(item).find("h3.title a").text(),
          date: $(item).find("time").attr("datetime"),
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
        ctx.logger.error("Error while CssWeeklyService.refresh, stack: ", e);
      }
    }
  }
}

module.exports = CssWeeklyService;
