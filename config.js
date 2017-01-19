var fs = require('fs-extra');

var srcDir = './src';
var wwwDir = './www';
var templateDir = './templates';
var templateExt = '.pug';

module.exports = {
	srcDir : fs.realpathSync(srcDir),
	wwwDir : fs.realpathSync(wwwDir),
	templateDir : fs.realpathSync(templateDir),
	templateExt : templateExt
}