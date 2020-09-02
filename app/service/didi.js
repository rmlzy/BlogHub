const Service = require("egg").Service;
const cheerio = require("cheerio");

/**
 * 滴滴云博客
 * https://blog.didiyun.com/
 */
class DidiService extends Service {
  async _savePost({ title, url }) {
    const { ctx, service } = this;
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data, { decodeEntities: false });
    const html = $("#content .ddc-article-content").html();
    const date = $("#content .ddc-article-header .ddc-article-info .ddc-article-info").eq(0).text();
    const markdown = ctx.helper.html2md(html);
    const post = {
      url,
      title,
      timestamp: +new Date(ctx.helper.getCommonDate(date)),
      from: "滴滴云博客",
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

  async _fetchTotalPage() {
    const { ctx } = this;
    const url = "https://blog.didiyun.com/";
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data);
    const lastStr = $(".wp-pagenavi .last").attr("href");
    const totalStr = lastStr.replace("/index.php/page/", "").replace("/", "");
    const total = Number(totalStr);
    return isNaN(total) ? 0 : total;
  }

  async _fetchPostList() {
    const { ctx } = this;
    const total = await this._fetchTotalPage();
    const list = [];
    for (let i = 1; i <= total; i++) {
      const url = `https://blog.didiyun.com/index.php/page/${i}/`;
      console.log(`🔨 (${i + 1}/${total}) ${url}`);
      const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
      const $ = cheerio.load(res.data);
      $("#main #content .ddc-post")
        .get()
        .map((item) => {
          list.push({
            title: $(item).find(".ddc-post-title").text().trim(),
            url: "https://blog.didiyun.com" + $(item).attr("href"),
          });
        });
    }
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
        ctx.logger.error("Error while DidiService.refresh, stack: ", e);
      }
    }
  }
}

module.exports = DidiService;
