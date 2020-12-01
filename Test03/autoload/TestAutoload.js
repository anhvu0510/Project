module.exports = {
  isActive: false,
  onLoad: () => {
    const app = require('..').getInstance();
    const logger = app.log4js.getLogger('default');
    logger.info('Test autoload');
    const __ = app.i18n.__;
    console.log(__('Test'));
  }
};
