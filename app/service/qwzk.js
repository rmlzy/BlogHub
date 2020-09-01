const Service = require("egg").Service;
const cheerio = require("cheerio");

/**
 * 奇舞周刊
 * https://weekly.75.team/
 */
class QwzkService extends Service {
  async _fetchPost({ title, url, date }) {
    const { ctx } = this;
    const res = await ctx.curl(url, { type: "GET", dataType: "text" });
    const $ = cheerio.load(res.data, { decodeEntities: false });
    const html = $("main .content").html();
    const miniHtml = ctx.helper.compressHtml(html);
    const markdown = ctx.helper.html2md(miniHtml);
    return {
      url,
      title,
      timestamp: +new Date(date),
      from: "奇舞周刊",
      content: markdown,
      wordCount: markdown.length,
      readCount: 0,
      likeCount: 0,
      dislikeCount: 0,
    };
  }

  async fetchWeekly() {
    const { ctx, service } = this;
    const url = "https://weekly.75.team";
    const weekly = [];
    const res = await ctx.curl(url, { type: "GET", dataType: "text" });
    const $ = cheerio.load(res.data);
    $(".issues .issue-list li")
      .get()
      .map((item) => {
        weekly.push({
          title: $(item).find("a").text().trim(),
          url: url + $(item).find("a").attr("href"),
          date: $(item).find("time").attr("datetime"),
        });
      });
    for (let i = 0; i < weekly.length; i++) {
      try {
        const post = await this._fetchPost(weekly[i]);
        const weeklyUrl = weekly[i].url;
        if (!post.content) {
          continue;
        }
        const existed = await service.post.findOne({ where: { url: weeklyUrl } });
        if (existed) {
          await service.post.update(post, { where: { url: weeklyUrl } });
        } else {
          await service.post.create(post);
        }
        console.log(`Insert ${weeklyUrl} OK`);
      } catch (e) {
        ctx.logger.error("Error while QwzkService.fetchWeekly, stack: ", e);
      }
    }
  }
}

module.exports = QwzkService;
