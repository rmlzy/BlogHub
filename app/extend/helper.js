"use strict";

const minify = require("html-minifier-terser").minify;
const showdown = require("showdown");
const jsdom = require("jsdom");
const dom = new jsdom.JSDOM();
const converter = new showdown.Converter();

module.exports = {
  md2html(md) {
    return converter.makeHtml(md);
  },

  html2md(html) {
    return converter.makeMarkdown(html, dom.window.document);
  },

  compressHtml(html) {
    // docs: https://github.com/terser/html-minifier-terser
    return minify(html, {
      removeComments: true,
      removeEmptyAttributes: true,
      removeEmptyElements: true,
    });
  },

  genSummaryFromMd(md) {
    const summary = md.substring(0, 200);
    return this.md2html(summary);
  },
};
