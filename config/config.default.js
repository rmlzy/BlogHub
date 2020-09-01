'use strict';

module.exports = appInfo => {
  const config = exports = {};

  config.keys = appInfo.name + '_codehub';

  config.middleware = [];

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
