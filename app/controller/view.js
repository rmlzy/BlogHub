"use strict";

const Controller = require("egg").Controller;
const timeago = require("timeago.js");

class ViewController extends Controller {
  async renderPosts() {
    const { ctx, service } = this;
    let posts = [];
    try {
      posts = await service.post.findAll({ order: [["timestamp", "DESC"]] });
      posts = posts.map((post) => {
        post.timeago = timeago.format(post.timestamp, "zh_CN");
        post.summary = ctx.helper.genSummaryFromMd(post.content);
        return post;
      });
    } catch (e) {
      ctx.logger.error("Error while ViewController.renderPosts, stack: ", e);
    }
    await ctx.render("posts.html", { posts });
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
