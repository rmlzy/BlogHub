const Service = require("egg").Service;

class PostService extends Service {
  async list({ category, page = 1, size = 10 }) {
    const { ctx } = this;
    let where = {};
    if (category) {
      where = { from: category };
    }
    const { count, rows } = await ctx.model.Post.findAndCountAll({
      order: [["timestamp", "DESC"]],
      where,
      raw: true,
      limit: size,
      offset: (page - 1) * size,
      attributes: { exclude: ["content"] },
    });
    return {
      category,
      total: count,
      list: rows,
      page: Number(page),
      size: Number(size),
    };
  }

  async findAll(condition) {
    const { ctx } = this;
    return ctx.model.Post.findAll(condition);
  }

  async findOne(condition) {
    const { ctx } = this;
    return ctx.model.Post.findOne(condition);
  }

  async create(row, condition) {
    const { ctx } = this;
    return ctx.model.Post.create(row, condition);
  }

  async update(row, condition) {
    const { ctx } = this;
    return ctx.model.Post.update(row, condition);
  }

  async bulkCreate(row, condition) {
    const { ctx } = this;
    return ctx.model.Post.bulkCreate(row, condition);
  }

  async destroy(condition) {
    const { ctx } = this;
    return ctx.model.Post.destroy(condition);
  }
}

module.exports = PostService;
