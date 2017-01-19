const pug = require('pug');
const klaw = require('klaw');
const fs = require('fs-extra');
const path = require('path');
const through2 = require('through2');
const commonmark = require('commonmark');
const fm = require('front-matter');
const sass = require('node-sass');

const config = require('./config');

var templates = {};

var initTemplates = function (callback) {

	klaw(config.templateDir)
		.on('data', function (item) {
			// check it's a template
			if(path.extname(item.path) === '.pug') {
				// get the template
				var template = pug.compileFile(item.path);
				var key = path.basename(item.path);
				console.log('templ',key, item.path);
				templates[key] = template;
			}
		})
		.on('end', function () {
			//console.log(templates);
			if(callback) {
				callback();
			}
		});
};


const renderBlog = pug.compileFile('./templates/blog_page.pug');


var buildPaths = function (item, ext) {

	var wwwRootPath = item.path.split(config.srcDir)[1];
	var newPathObj = path.parse(wwwRootPath);
	newPathObj.ext = ext;
	delete newPathObj.base;

	var out = {
		url : path.format(newPathObj),
		renderPath : './www' + path.format(newPathObj),
		filePath : item.path
	}
	console.log('PATH BUILDER', out);
	return out;
}

var shouldIgnore = function (item) {
	var key = path.basename(item);
	return key === '_' || key[0] !== '_';
}

var copyWholesale = function (item) {
	// if it's a folder
	if(item.stats.isDirectory()) {
		// and that folder has an 'index.html' at the root
		if(fs.existsSync(item.path + '/index.html')) {
			return true;
		}
	}
	return false;
}

var getMarkdown = function (item) {

	var file = fs.readFileSync(item.path, 'utf-8');
	var frontMatter = fm(file);
	var paths = buildPaths(item, '.html');

	return Object.assign({}, frontMatter, paths, {format : 'markdown'});
};


var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

var renderMarkdown = function (data) {

	// crackers commonmark implementation of handling markdown (I like it)
	var parsed = reader.parse(data.body);
	data.rendered = writer.render(parsed);

	return renderBlog(data); //output HTML
};


var isMarkdown = function (item) {
	var mdExt  = [
		".markdown", ".mdown", ".mkdn", ".mkd", ".md"
	];
	return (mdExt.indexOf(path.extname(item.path)) > -1);
};

var getSass = function (item) {
	var paths = buildPaths(item, '.css');
	return Object.assign({}, paths, {format : 'sass'});
};

var renderSass = function (data) {
	return sass.renderSync({
		file : data.filePath,
		outFile : data.renderPath
	});
}

var isSass = function (item) {
	var sassExt = [
		".scss", ".sass"
	];
	return (sassExt.indexOf(path.extname(item.path)) > -1);
};

var renderJSON = function (data) {
	var json = data.data.data || {};
	return templates[data.data._template](json);
}

var getJSON = function (item) {
	var paths = buildPaths(item, '.html');
	var json = fs.readJsonSync(item.path);
	return Object.assign({}, paths, {format : 'json', data : json});
}

var isJSON = function (item) {
	return (path.extname(item.path) === '.json');
}

module.exports = {
	isJSON : isJSON,
	getJSON : getJSON,
	renderJSON : renderJSON,
	isSass : isSass,
	getSass : getSass,
	renderSass : renderSass,
	isMarkdown : isMarkdown,
	getMarkdown : getMarkdown,
	renderMarkdown : renderMarkdown,
	copyWholesale : copyWholesale,
	shouldIgnore : shouldIgnore,
	initTemplates : initTemplates
}