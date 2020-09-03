"use strict";

const Controller = require("egg").Controller;

class ViewController extends Controller {
  async renderPosts() {
    const { ctx } = this;
    const sources = [
      {
        name: "美团技术团队",
        logo: "/public/img/meituan-logo.jpg",
      },
      {
        name: "滴滴云博客",
        logo: "/public/img/didi-logo.png",
      },
      {
        name: "奇舞周刊",
        logo: "/public/img/qwzk-logo.png",
      },
      {
        name: "科技爱好者周刊",
        logo: "",
      },
      {
        name: "当然我在扯淡",
        logo: "/public/img/yinwang-logo.jpg",
      },
      {
        name: "有赞技术团队",
        logo: "/public/img/youzan-logo.jpg",
      },
      {
        name: "CODING HORROR",
        logo: "/public/img/codinghorror-logo.jpg",
      },
      {
        name: "DiscoverDev",
        logo: "/public/img/disdev-logo.jpg",
      },
      {
        name: "七牛云博客",
        logo: "/public/img/qiniu-logo.png",
      },
      {
        name: "风雪之隅",
        logo: "",
      },
      {
        name: "歪麦博客",
        logo: "",
      },
      {
        name: "白俊遥博客",
        logo: "",
      },
    ];
    await ctx.render("posts.html", { title: "BlogHub", sources });
  }

  async renderPost() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    let blog = {};
    try {
      blog = await service.post.findOne({ where: { id } });
      blog.content = ctx.helper.md2html(blog.content);
    } catch (e) {
      ctx.logger.error("Error while ViewController.renderPost, stack: ", e);
    }
    await ctx.render("post.html", { title: blog.title, blog });
  }
}

module.exports = ViewController;
