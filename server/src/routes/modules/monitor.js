const Router = require('@koa/router');
const controller = require('../../controllers/monitorController');

const router = new Router({
  prefix: '/api/monitor'
});

router.get('/check', controller.check.bind(controller));

module.exports = router;