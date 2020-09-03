"use strict";

module.exports = () => {
  return async function (ctx, next) {
    ctx.locals.version = ctx.app.config.version;
    await next();
  };
};
