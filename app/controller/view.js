"use strict";

const Controller = require("egg").Controller;

class ViewController extends Controller {
  async renderPosts() {
    const { ctx } = this;
    await ctx.render("posts.html");
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
    await ctx.render("post.html", { blog });
  }
}

module.exports = ViewController;
