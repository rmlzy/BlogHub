'use strict';

module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.view.renderPosts);
  router.get('/post/:id', controller.view.renderPost);

  router.get('/api/load', controller.api.load);
};
