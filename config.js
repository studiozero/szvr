var fs = require('fs-extra');

var srcDir = './src';
var templateDir = './templates';
var templateExt = '.pug';

module.exports = {
	srcDir : fs.realpathSync(srcDir),
	templateDir : fs.realpathSync(templateDir),
	templateExt : templateExt
}