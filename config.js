var fs = require('fs-extra');
var moment = require('moment');
var info = require('./package.json');

var srcDir = './src';
var wwwDir = './www';
var templateDir = './templates';
var templateExt = '.pug';
var canonicalRoot = 'http://studiozero.co';
var datePattern = 'MMM do, YYYY'; // follows momentjs date formatting - https://momentjs.com/docs/#/parsing/string-format/
var version = info.version || 0;

var defaultData = {
	"_paths" : {},
	"_template" : "index.pug",
	"_metadata" : {
		date: moment().format(datePattern),
		site : 'Studio Zero',
		url: canonicalRoot, // but is overwritten by canonicalRoot + path for generated pages
		image: canonicalRoot + '/assets/images/studiozero_og1200x1200.jpg',
		title: 'We are Studio Zero', // keep it short
		sell: 'We are Studio Zero | Immersive Web | VR | AR | MR | AI', // keep it < 80 chars
		summary: 'A creative studio building VR products and experiences for the web.', // keep it < 120 chars
		description: 'A creative studio building VR products and experiences for the web.', // keep it focused
		systemVersion : version
	}
};

module.exports = {
	srcDir : fs.realpathSync(srcDir),
	wwwDir : wwwDir,
	templateDir : fs.realpathSync(templateDir),
	templateExt : templateExt,
	defaultData : defaultData,
	canonicalRoot : canonicalRoot,
	datePattern : datePattern,
	version : version
}