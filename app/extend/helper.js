"use strict";

const timeago = require("timeago.js");
const minify = require("html-minifier-terser").minify;
const showdown = require("showdown");
const TurndownService = require("turndown");
const turndownService = new TurndownService();
const converter = new showdown.Converter();

module.exports = {
  md2html(md) {
    return converter.makeHtml(md);
  },

  html2md(html) {
    return turndownService.turndown(html);
  },

  compressHtml(html) {
    // docs: https://github.com/terser/html-minifier-terser
    return minify(html, {
      removeComments: true,
      removeEmptyAttributes: true,
      removeEmptyElements: true,
    });
  },

  genSummaryFromMd(md = "") {
    if (md.length < 255) {
      return md;
    }
    return "摘要算法尚未完成!";
  },

  timeago(ts) {
    return timeago.format(ts, "zh_CN");
  },

  getCommonDate(date) {
    if (!date) return "";
    return date.replace("年", "-").replace("月", "-").replace("日", "");
  },
};
