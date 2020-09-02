"use strict";

const Controller = require("egg").Controller;

class ApiController extends Controller {
  async load() {
    const { ctx, service } = this;
    const weekly = await service.ryf.refresh(true);
    ctx.body = { success: true, message: "操作成功", data: weekly };
  }

  async post() {
    const { ctx, service } = this;
    try {
      const { page, size } = ctx.request.query;
      const res = await service.post.list({ page: Number(page), size: Number(size) });
      res.list = res.list.map((post) => {
        post.timeago = ctx.helper.timeago(post.timestamp);
        post.summary = ctx.helper.genSummaryFromMd(post.content);
        return post;
      });
      ctx.body = {
        success: true,
        message: "操作成功",
        data: res,
      };
    } catch (e) {
      ctx.logger.error("Error while ApiController.post, stack: ", e);
      ctx.body = { success: false, message: "内部服务器错误" };
    }
  }
}

module.exports = ApiController;
