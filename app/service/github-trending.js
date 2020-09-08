const Service = require("egg").Service;
const cheerio = require("cheerio");

/**
 * Github Trending
 * http://util.city/tool/trending.html
 */
class GithubTrendingService extends Service {
  async _savePost({ title, url, date }) {
    const { service } = this;
    const content = await this._fetchDate(date);
    const post = {
      url,
      title,
      timestamp: +new Date(date),
      from: "Github Trending",
      content,
      wordCount: content.length,
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

  async _fetchDate(date) {
    const { ctx } = this;
    const langs = ["", "html", "shell", "css", "typescript", "python", "ruby", "rust", "java", "javascript"];
    const content = [];
    for (let i = 0; i < langs.length; i++) {
      const url = `http://util.city/tool/trending.html?date=${date}&lang=${langs[i]}&since=daily`;
      const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
      const $ = cheerio.load(res.data, { decodeEntities: false });
      $(".btn-default").replaceWith("");
      const html = $(".panel-body").html();
      if (html) {
        const markdown = ctx.helper.html2md(html);
        const lang = langs[i].toUpperCase() || "All Language";
        content.push(`\n## ${lang}\n`);
        content.push(markdown);
      }
    }
    return content.join("\n\n");
  }

  async _fetchPostList() {
    const { ctx } = this;
    const url = "http://util.city/tool/trending.html";
    const list = [];
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data);
    $("#js_dateSelect option")
      .get()
      .map((item) => {
        const date = $(item).text();
        list.push({
          title: `Github Trending - ${date}`,
          url: `http://util.city/tool/trending.html?date=${date}`,
          date,
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
        ctx.logger.error("Error while GithubTrendingService.refresh, stack: ", e);
      }
    }
  }
}

module.exports = GithubTrendingService;
