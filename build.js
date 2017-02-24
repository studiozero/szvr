// get the stuff
const fs = require('fs-extra');
const path = require('path');
const klaw = require('klaw');
const through2 = require('through2');

const config = require('./config');
const help = require('./helpers');
const imagePrep = require('./image-prep.js');


// Start here

var build = function () {

	console.log('# Generating new site');

// get rid of the old www folder
	fs.removeSync('./www');

	console.log('* Removed `/www` folder');
	var toCopy = [];
	var toRender = [];


	klaw(config.srcDir, {filter : help.shouldIgnore})
		.on('data', function (item) {


			// if folder has index.html at the root, don't load anything, just store the reference for copying
			if(help.copyWholesale(item)) {
				// mark as 'to copy as is'
				console.log('* Copy without building - ', item.path);
				toCopy.push(item.path);
				// it'd be great to be able to step out here of drilling down... hints?
				return true; // skip to next item
			}

			// so, from here, assume most things are markdown files, template, folders, images etc.
			if(help.isMarkdown(item) ) {
				console.log('* Get Markdown data', item.path);
				toRender.push(help.getMarkdown(item));
			}

			if(help.isSass(item)) {
				console.log('* Get SASS data', item.path);
				toRender.push(help.getSass(item));
			}

			if(help.isJSON(item)) {
				console.log('* Get JSON data', item.path);
				var out = help.getJSON(item);
				if(out) {
					toRender.push(out);
				}
			}


		})
		.on('end', function () {
			console.log('---------------');

			// do the rendering of the markdowns
			toRender.forEach(function (data) {
				var output;
				data._site_data = help.getSiteData();

				switch (data._format) {
					case 'markdown' :
						output = help.renderMarkdown(data);
						break;
					case 'sass' :
						output = help.renderSass(data);
						break;
					case 'json' :
						output = help.renderJSON(data)
						break;
					default :
						console.error('Not a valid format')
				}

				console.log('* Rendered', data._paths.renderPath);
				fs.outputFileSync(data._paths.renderPath, output);
			});

			fs.copy('./aws-upload.conf.js', './www/aws-upload.conf.js', function (err) {
				if(err) {
					console.error('### Fail', err);
				} else {
				}
			});


			// copy the standalone folders as they are
			toCopy.forEach(function (dir) {
				try {
					fs.copySync(dir, `./www/${path.basename(dir)}`);
					console.log('### Copied', path.basename(dir));

				} catch (err) {
					console.error('### Fail', err);
				}
			});

			console.log('SITE DATA',help.getSiteData());
			// Move images
			imagePrep.produce();
		});

};

help.initTemplates(build);