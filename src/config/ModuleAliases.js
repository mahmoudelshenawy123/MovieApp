const moduleAlias = require('module-alias');

moduleAlias.addAliases({
  '@src': __dirname + '/../',
  '@': __dirname + '/',
});
