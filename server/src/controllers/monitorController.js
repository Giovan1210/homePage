const BaseController = require('../utils/baseController');
const { HttpStatus } = require('../utils/response');
const { checkDomain } = require('../utils/domainMonitor');

class MonitorController extends BaseController {
  // GET /api/monitor/check?url=https://example.com
  async check(ctx) {
    try {
      const { url } = ctx.query;
      if (!url) this.throwHttpError('缺少 url 参数', HttpStatus.BAD_REQUEST);

      const data = await checkDomain(url);
      this.ok(ctx, data, 'Domain check success');
    } catch (err) {
      this.fail(ctx, err, HttpStatus.BAD_GATEWAY);
    }
  }
}

module.exports = new MonitorController();