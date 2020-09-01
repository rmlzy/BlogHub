const Service = require("egg").Service;
const cheerio = require("cheerio");

class RuanyifengService extends Service {
  async _fetchPost(url) {
    const { ctx } = this;
    const res = await ctx.curl(url, { type: "GET", dataType: "text" });
    const $ = cheerio.load(res.data, { decodeEntities: false });
    const $body = $("#alpha-inner");
    const title = $body.find("#page-title").text();
    const date = $body.find(".asset-footer .published").attr("title");
    const from = "科技爱好者周刊";
    const content = $body.find("#main-content").html();
    const contentText = $body.find("#main-content").text();
    return {
      url,
      title,
      timestamp: +new Date(date),
      from,
      content,
      description: contentText.length > 255 ? contentText.substring(0, 255) : contentText,
      wordCount: contentText.length,
      readCount: 0,
      likeCount: 0,
      dislikeCount: 0,
    };
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
      console.log(`Insert ${weeklyUrls[i]} OK`);
    }
    // const post = await this._fetchPost("http://www.ruanyifeng.com/blog/2020/08/weekly-issue-122.html");
    // console.log(post.timestamp);
  }
}

module.exports = RuanyifengService;
