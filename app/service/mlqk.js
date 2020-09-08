const Service = require("egg").Service;
const cheerio = require("cheerio");

/**
 * 码力全开
 * https://www.maliquankai.com/
 */
class MlqkService extends Service {
  async _savePost({ title, url, date }) {
    const { ctx, service } = this;
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data, { decodeEntities: false });
    let html = $("article.page__post .post__content").html();
    const re = new RegExp('data-src', 'g');
    html = html.replace(re, 'src');
    const markdown = ctx.helper.html2md(html);
    const post = {
      url,
      title,
      timestamp: +new Date(ctx.helper.getCommonDate(date)),
      from: "码力全开",
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
    const url = "https://www.maliquankai.com/";
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data);
    const lastStr = $(".paginator__list .paginator__item a").eq(2).text().trim();
    const total = Number(lastStr);
    return isNaN(total) ? 0 : total;
  }

  async _fetchPostList() {
    const { ctx } = this;
    const total = await this._fetchTotalPage();
    const list = [];
    for (let i = 1; i <= total; i++) {
      const url = i === 1 ? "https://www.maliquankai.com/" : `https://www.maliquankai.com/page/${i}/`;
      console.log(`🔨 (${i}/${total}) ${url}`);
      const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
      const $ = cheerio.load(res.data);
      $(".page__posts .page__post")
        .get()
        .map((item) => {
          list.push({
            title: $(item).find(".mini-article__title a").text().trim(),
            url: "https://www.maliquankai.com" + $(item).find(".mini-article__title a").attr("href"),
            date: $(item).find(".tags__time").text().trim(),
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
        ctx.logger.error("Error while MlqkService.refresh, stack: ", e);
      }
    }
  }
}

module.exports = MlqkService;
