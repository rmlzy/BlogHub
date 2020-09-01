"use strict";

const Controller = require("egg").Controller;

class ApiController extends Controller {
  async load() {
    const { ctx, service } = this;
    const weekly = await service.qwzk.fetchWeekly();
    ctx.body = { success: true, message: "操作成功", data: weekly };
  }
}

module.exports = ApiController;
