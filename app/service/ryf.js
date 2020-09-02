const Service = require("egg").Service;
const cheerio = require("cheerio");

/**
 * 科技爱好者周刊
 * http://www.ruanyifeng.com/blog/weekly/
 */
class RyfService extends Service {
  async _savePost({ url }) {
    const { ctx, service } = this;
    const res = await ctx.curl(url, { type: "GET", dataType: "text" });
    const $ = cheerio.load(res.data, { decodeEntities: false });
    const $body = $("#alpha-inner");
    const title = $body.find("#page-title").text();
    const date = $body.find(".asset-footer .published").attr("title");
    const html = $body.find("#main-content").html();
    const markdown = ctx.helper.html2md(html);
    const post = {
      url,
      title,
      timestamp: +new Date(date),
      from: "科技爱好者周刊",
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

  async fetchWeekly() {
    const { ctx, service } = this;
    const url = "http://www.ruanyifeng.com/blog/weekly/";
    const weeklyUrls = [];
    const res = await ctx.curl(url, { type: "GET", dataType: "text" });
    const $ = cheerio.load(res.data);
    $("#alpha-inner .module-list-item")
      .get()
      .map((item) => {
        weeklyUrls.push($(item).find("a").attr("href"));
      });
    for (let i = 0; i < weeklyUrls.length; i++) {
      try {
        const post = await this._fetchPost(weeklyUrls[i]);
        if (!post.content) {
          continue;
        }
        const existed = await service.post.findOne({ where: { url: weeklyUrls[i] } });
        if (existed) {
          await service.post.update(post, { where: { url: weeklyUrls[i] } });
        } else {
          await service.post.create(post);
        }
      } catch (e) {
        ctx.logger.error("Error while RyfService.fetchWeekly, stack: ", e);
      }
    }
  }

  async _fetchPostList() {
    const { ctx } = this;
    const url = "http://www.ruanyifeng.com/blog/weekly/";
    const list = [];
    const res = await ctx.curl(url, { type: "GET", dataType: "text" });
    const $ = cheerio.load(res.data);
    $("#alpha-inner .module-list-item")
      .get()
      .map((item) => {
        list.push({
          url: $(item).find("a").attr("href"),
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
        ctx.logger.error("Error while YinwangService.refresh, stack: ", e);
      }
    }
  }
}

module.exports = RyfService;
