const pug = require('pug');
const klaw = require('klaw');
const fs = require('fs-extra');
const path = require('path');
const through2 = require('through2');
const commonmark = require('commonmark');
const fm = require('front-matter');
const sass = require('node-sass');
const moment = require('moment');

const config = require('./config');
const imagePrep = require('./image-prep.js');

var templates = {};
var site_data = {};

var initTemplates = function (callback) {

	config.topLevelFolders.forEach(function (submenu) {
		site_data[submenu.dir] = Object.assign({}, submenu, {contents : []});
	});

	klaw(config.templateDir, {filter : shouldIgnore})
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


const renderStandardPage = pug.compileFile('./templates/blog_page.pug');


var buildPaths = function (item, ext, forceIndex) {

	var wwwRootPath = item.path.split(config.srcDir)[1];
	var newPathObj;

	if(forceIndex) {
		console.log(wwwRootPath);
		var oldPathObject = path.parse(wwwRootPath);
		newPathObj = {
			root : '',
			dir : 	oldPathObject.dir + '/' + oldPathObject.name,
			name : 'index',
			ext : ext
		}

	} else {

		newPathObj = path.parse(wwwRootPath);
		newPathObj.ext = ext;
		delete newPathObj.base;

	}

	var renderPath = path.format(newPathObj);
	delete newPathObj.ext;
	delete newPathObj.name;
	var prettyPath = path.format(newPathObj); // drops the /index.html from the path

	return {
		url : renderPath,
		renderPath : config.wwwDir + renderPath,
		filePath : item.path,
		prettyPath : prettyPath,
		canonicalURL : config.canonicalRoot + prettyPath
	};
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
};

var addToSiteData = function (meta) {

	for(key in site_data) {
		var submenu = site_data[key];
		if(meta._paths.url.indexOf(`/${submenu.dir}/`) >= 0){
			// add as a blog item
			submenu.contents.push(meta);
		}
	}

}

var prepareMetaData = function (mergedData) {
	// for the moment, we ONLY care about setting _template and _metadata
	console.log('###########\n*** Merge', mergedData);
	mergedData._metadata.imageData = imagePrep.setImageData(mergedData._metadata.image);

	mergedData._metadata.prettyDate = moment(mergedData._metadata.date).format('MMMM Do, YYYY');

	if(!mergedData._metadata.author) {
		mergedData._metadata.author = "Studio Zero"
	}

	addToSiteData(mergedData);

	return mergedData;
}

var reader = new commonmark.Parser();
var writer = new commonmark.HtmlRenderer();

var getMarkdown = function (item) {

	var file = fs.readFileSync(item.path, 'utf-8');
	var frontMatter = fm(file);
	var paths = buildPaths(item, '.html', true);

	// prepare all the metadata apart from the body contents or other contents of JSON if it's a JSON file

	var mergedData = Object.assign({},
		config.defaultData,
		{
			_format : 'markdown',
			_paths : paths,
			_metadata : frontMatter.attributes,
			body : frontMatter.body
		});

	return prepareMetaData(mergedData);
};


var renderMarkdown = function (data) {
	// crackers commonmark implementation of handling markdown (I like it)
	var parsed = reader.parse(data.body);
	data.rendered = writer.render(parsed);

	return renderStandardPage(data); //output HTML
};

var renderKnol = function (frontMatter) {
	var parsed = reader.parse(frontMatter.body);
	frontMatter.html = writer.render(parsed);
	return Object.assign({}, frontMatter);
}


var isMarkdown = function (item) {
	var mdExt  = [
		".markdown", ".mdown", ".mkdn", ".mkd", ".md"
	];
	return (mdExt.indexOf(path.extname(item.path)) > -1);
};

var getSass = function (item) {
	var paths = buildPaths(item, '.css');
	return Object.assign({}, {_format : 'sass', _paths : paths});
};

var renderSass = function (data) {
	return sass.renderSync({
		file : data._paths.filePath
	}).css;
}

var isSass = function (item) {
	var sassExt = [
		".scss", ".sass"
	];
	return (sassExt.indexOf(path.extname(item.path)) > -1);
};

var renderJSON = function (data) {
	return templates[data._template](data);
}

var getJSON = function (item) {
	var paths = buildPaths(item, '.html'); // compiling to .html
	var json = fs.readJsonSync(item.path);

	if(!json._template || !json._metadata) {
		console.error(item.path, 'is not a valid sz .json file');
		return false
	}

	var knols = {};
	// Add knols
	if(json._knols) {
		json._knols.forEach(function (knol){

			var key = path.basename(knol, '.md');

			var knolPath = `./knols/${key}.md`;


			var file = fs.readFileSync(knolPath, 'utf-8'); // is markdown knol
			var frontMatter = fm(file); // gets the data
			knols[key] = renderKnol(frontMatter);
		})
	}
	
	// prepare all the metadata apart from the body contents or other contents of JSON if it's a JSON file

	// empty metadata node crushes default data :(

	var mergedMeta = Object.assign({}, config.defaultData._metadata, json._metadata);
	
	var mergedData = Object.assign({}, 
		config.defaultData, 
		json, 
		{
			_format : 'json',
			_knols : knols,
			_paths : paths,
			_metadata: mergedMeta
		});
	
	return prepareMetaData(mergedData);
};

var isJSON = function (item) {
	return (path.extname(item.path) === '.json');
};

var getSiteData = function () {
	// get blog list in time order
	site_data.blog.contents.sort(function (a,b){
		if(!a._metadata.date || !b._metadata.date) {
			return 0;
		}
		// older
		if(moment(a._metadata.date) > moment(b._metadata.date)) return -1;
		// younger
		if(moment(a._metadata.date) < moment(b._metadata.date)) return 1;
		// the same
		return 0;
	});

	return site_data;
};

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
	initTemplates : initTemplates,
	getSiteData : getSiteData
}