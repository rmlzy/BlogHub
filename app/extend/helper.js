"use strict";


const MarkdownIt = require("markdown-it");
const hljs = require("highlight.js");
const timeago = require("timeago.js");
const minify = require("html-minifier-terser").minify;
const TurndownService = require("turndown");
const turndownService = new TurndownService();
const md = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }
    return "";
  },
});

module.exports = {
  md2html(markdown) {
    return md.render(markdown);
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
