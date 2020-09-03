const Subscription = require("egg").Subscription;

class RefreshSchedule extends Subscription {
  static get schedule() {
    return {
      cron: "0 0 0/2 * * ? ", // 每两个小时执行一次
      type: "all",
      immediate: true,
    };
  }

  async subscribe() {
    const { ctx } = this;
    try {
      await ctx.service.awaimai.refresh(true);
      await ctx.service.baijunyao.refresh(true);
      await ctx.service.codinghorror.refresh(true);
      await ctx.service.didi.refresh(true);
      await ctx.service.disdev.refresh(true);
      await ctx.service.laruence.refresh(true);
      await ctx.service.meituan.refresh(true);
      await ctx.service.qiniu.refresh(true);
      await ctx.service.qwzk.refresh(true);
      await ctx.service.ryf.refresh(true);
      await ctx.service.yinwang.refresh(true);
      await ctx.service.youzan.refresh(true);
    } catch (e) {
      ctx.logger.error("抓取码力全开设计资源失败: ", e);
    }
  }
}

module.exports = RefreshSchedule;
