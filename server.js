var connect = require('connect');
var serveStatic = require('serve-static');
var compression = require('compression');

connect()
.use(compression())
.use(serveStatic('./build'))
.listen(process.env.PORT);
