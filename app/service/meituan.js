const Service = require("egg").Service;
const cheerio = require("cheerio");

/**
 * 美团技术团队
 * https://tech.meituan.com/
 */
class MeituanService extends Service {
  async _savePost({ title, url }) {
    const { ctx, service } = this;
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data, { decodeEntities: false });
    const html = $(".post-container .post-content").html();
    const date = $(".post-container .meta-box .m-post-date").text();
    const markdown = ctx.helper.html2md(html);
    const post = {
      url,
      title,
      timestamp: +new Date(ctx.helper.getCommonDate(date)),
      from: "美团技术团队",
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
    const url = "https://tech.meituan.com/archives";
    const list = [];
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data);
    $(".post-container .post-title")
      .get()
      .map((item) => {
        list.push({
          title: $(item).find("a").text().trim(),
          url: "https://tech.meituan.com" + $(item).find("a").attr("href"),
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
        ctx.logger.error("Error while MeituanService.refresh, stack: ", e);
      }
    }
  }
}

module.exports = MeituanService;
