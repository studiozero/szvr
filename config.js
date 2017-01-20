var fs = require('fs-extra');

var srcDir = './src';
var wwwDir = './www';
var templateDir = './templates';
var templateExt = '.pug';
var canonicalRoot = 'http://studiozero.co';

var defaultData = {
	"_paths" : {},
	"_template" : "index.pug",
	"_metadata" : {
		date: new Date(),
		site : 'Studio Zero',
		url: canonicalRoot, // but is overwritten by canonicalRoot + path for generated pages
		image: canonicalRoot + '/assets/images/studiozero_og1200x1200.jpg',
		title: 'We are Studio Zero', // keep it short
		sell: 'We are Studio Zero | Immersive Web | VR | AR | MR | AI', // keep it < 80 chars
		summary: 'A creative studio building VR products and experiences for the web.', // keep it < 120 chars
		description: 'A creative studio building VR products and experiences for the web.' // keep it focused
	}
};

module.exports = {
	srcDir : fs.realpathSync(srcDir),
	wwwDir : wwwDir,
	templateDir : fs.realpathSync(templateDir),
	templateExt : templateExt,
	defaultData : defaultData,
	canonicalRoot : canonicalRoot
}