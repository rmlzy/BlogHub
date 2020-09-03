"use strict";

module.exports = (appInfo) => {
  const config = (exports = {});

  config.keys = appInfo.name + "_bloghub";

  config.middleware = ["locals"];

  config.version = "2020-09-05";

  // 路由无法匹配
  config.notfound = {
    pageUrl: "/404.html",
  };

  // 安全配置
  config.security = {
    // 关闭 csrf 防范
    csrf: false,
  };

  // 模板引擎配置
  // https://mozilla.github.io/nunjucks/
  config.view = {
    defaultViewEngine: "nunjucks",
    mapping: {
      ".html": "nunjucks",
    },
  };

  return config;
};
