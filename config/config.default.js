"use strict";

module.exports = (appInfo) => {
  const config = (exports = {});

  config.keys = appInfo.name + "_codehub";

  config.middleware = ["locals"];

  config.version = "2020-09-03";

  // 路由无法匹配
  config.notfound = {
    pageUrl: "/404.html",
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
