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
        return post;
      });
    } catch (e) {
      console.log(e);
    }
    await ctx.render("posts.html", { posts });
  }

  async renderPost() {
    const { ctx } = this;
    await ctx.render("post.html");
  }
}

module.exports = ViewController;
