"use strict";

const dayjs = require("dayjs");

module.exports = (app) => {
  const { INTEGER, STRING, TEXT, DATE } = app.Sequelize;
  const Post = app.model.define("Post", {
    id: {
      type: INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
    },

    // 标题
    title: {
      type: STRING(500),
      allowNull: false,
    },

    // 发布时间, 13位时间戳
    timestamp: {
      type: STRING(20),
      allowNull: false,
    },

    // 来源
    from: {
      type: STRING(500),
      allowNull: false,
    },

    // 地址
    url: {
      type: STRING(1024),
      allowNull: false,
    },

    // 内容
    content: {
      type: TEXT,
      allowNull: false,
    },

    // 字数统计
    wordCount: {
      type: INTEGER,
      defaultValue: 0,
    },

    // 阅读数
    readCount: {
      type: INTEGER,
      defaultValue: 0,
    },

    // 喜欢数
    likeCount: {
      type: INTEGER,
      defaultValue: 0,
    },

    // 讨厌数
    dislikeCount: {
      type: INTEGER,
      defaultValue: 0,
    },

    createdAt: {
      type: DATE,
      get() {
        const createdAt = this.getDataValue("createdAt");
        return dayjs(createdAt).format("YYYY-MM-DD HH:mm:ss");
      },
    },

    updatedAt: {
      type: DATE,
      get() {
        const updatedAt = this.getDataValue("updatedAt");
        return dayjs(updatedAt).format("YYYY-MM-DD HH:mm:ss");
      },
    },
  });
  return Post;
};
