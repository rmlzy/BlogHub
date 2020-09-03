"use strict";

module.exports = () => {
  return async function (ctx, next) {
    ctx.locals.version = ctx.app.config.version;
    if (ctx.request.headers.cookie) {
      ctx.locals.theme = ctx.request.headers.cookie.includes("theme=dark") ? "dark" : "light";
    } else {
      ctx.locals.theme = "light";
    }
    await next();
  };
};
