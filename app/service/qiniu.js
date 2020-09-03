const Service = require("egg").Service;
const cheerio = require("cheerio");

/**
 * 七牛云博客
 * https://blog.qiniu.com/
 */
class QiniuService extends Service {
  async _savePost({ title, url, date }) {
    const { ctx, service } = this;
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data, { decodeEntities: false });
    const html = $(".blog-html").html();
    const markdown = ctx.helper.html2md(html);
    const post = {
      url,
      title,
      timestamp: +new Date(ctx.helper.getCommonDate(date)),
      from: "七牛云博客",
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
    const url = "https://blog.qiniu.com/archives/all";
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data);
    const totalStr = $(".pagination .page").eq(6).text().trim();
    const total = Number(totalStr);
    return isNaN(total) ? 0 : total;
  }

  async _fetchPostList() {
    const { ctx } = this;
    const total = await this._fetchTotalPage();
    const list = [];
    for (let i = 1; i <= total; i++) {
      const url = `https://blog.qiniu.com/archives/all?page=${i}`;
      console.log(`🔨 (${i}/${total}) ${url}`);
      const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
      const $ = cheerio.load(res.data);
      $(".blog-content")
        .get()
        .map((item) => {
          list.push({
            title: $(item).find("a.title").text().trim(),
            url: "https://blog.qiniu.com" + $(item).find("a.title").attr("href"),
            date: $(item).find(".entry-date a").text().trim()
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
        ctx.logger.error("Error while QiniuService.refresh, stack: ", e);
      }
    }
  }
}

module.exports = QiniuService;
