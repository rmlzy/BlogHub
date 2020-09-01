const Service = require("egg").Service;

class PostService extends Service {
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
