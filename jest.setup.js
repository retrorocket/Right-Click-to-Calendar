Object.assign(global, require('jest-chrome'))
global.moment = require("moment");
global.jsdom.reconfigure({
  url: 'http://localhost/path?alert=true',
});
global.$ = require("jquery");
