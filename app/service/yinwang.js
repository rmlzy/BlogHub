const Service = require("egg").Service;
const cheerio = require("cheerio");

/**
 * 王银的博客
 * http://www.yinwang.org/
 */
class YinwangService extends Service {
  async _savePost({ title, url, date }) {
    const { ctx, service } = this;
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data, { decodeEntities: false });
    const html = $(".inner").html();
    const markdown = ctx.helper.html2md(html);
    const post = {
      url,
      title,
      timestamp: +new Date(date),
      from: "当然我在扯淡",
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
    const url = "http://www.yinwang.org";
    const list = [];
    const res = await ctx.curl(url, { type: "GET", dataType: "text", timeout: 10000 });
    const $ = cheerio.load(res.data);
    $(".outer .list-group li")
      .get()
      .map((item) => {
        let date = $(item).find(".date").text();
        date = date.replace("年", "-").replace("月", "-").replace("日", "");
        list.push({
          title: $(item).find("a").text().trim(),
          url: url + $(item).find("a").attr("href"),
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
        ctx.logger.error("Error while YinwangService.fetchWeekly, stack: ", e);
      }
    }
  }
}

module.exports = YinwangService;
