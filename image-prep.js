const fs = require('fs-extra');
const gm = require('gm');
const path = require('path');

const config = require('./config');
var imagesToGenerate = [];
// NB If you're trying to re-do the image, remove the .json from the _originals folder for the image

// TODO - create callback so that generated images are copied over OR generate them into the right place!
var setImageData = function (imageStr) {
	var alreadyGenerated = false;
	// check if it's likely an image
	var imageData = {
		original : imageStr,
		// see https://nodejs.org/docs/latest/api/path.html#path_path_parse_path
		path : path.parse(imageStr),
		bgStyle : false
	};

	if(imageStr.indexOf('#') === 0) {
		// it's a color
		imageData.imgUrl = false;
		imageData.bgStyle = `background-color : ${imageStr};`;
		return imageData;
	}

	// check to see if JSON already exists
	var someImageFile;
	try {
		someImageFile = fs.readJsonSync(`./src/assets/generated/${imageData.path.name}.json`);
		console.log(`Images already generated, remove ./src/assets/generated/${imageData.path.name}.json if you need to regenerate from source`);
		imageData = Object.assign({}, imageData, someImageFile);
		alreadyGenerated = true;
	} catch (err) {
		// there's an error here
	}


	for (key in config.imagePresets) {
		var preset = config.imagePresets[key];
		var keyUrl = key + 'Url';
		if(!imageData[keyUrl]) { imageData[keyUrl] = preset.prefix + generateOutputUrl(imageData, key)}
	}

	imageData.bgStyle = `background-image : url(${imageData.imgUrl}); background-size: cover;`;

	if(!alreadyGenerated) {
		imagesToGenerate.push(imageData);
	} else {
		console.log('Already generated images for ', imageData.path.name);
	}
	return imageData;
};

var generateOutputUrl = function (imageData, type = 'img') {

	var i = config.imagePresets[type];
	return `/assets/generated/${imageData.path.name + i.suffix + imageData.path.ext}`;
};

var generateImage = function (imageData, type = 'img') {
	// find the image
	// resize it as per the config settings
	// put it in /assets/generate/...
	var i = config.imagePresets[type];
	if(!i) {
		console.error('Image resize does not recognise an image preset for : ', type);
		return false;
	}
	var original = gm(`${config.artworkSrc}/${imageData.path.base}`);
	switch (type) {
		case 'amp':
		case 'tw' :
		case 'fb' :
			original.resize(i.width, i.height, '^')
				.gravity('Center')
				.crop(i.width, i.height)
			break;
		default :
			original.resize(i.width,i.height, '^')
			break;
	}

	original.noProfile()
		// put it in the output folder
		.write(`./www/assets/generated/${imageData.path.name + i.suffix + imageData.path.ext}`, function (err) {
			if(err) {
				console.error('Error generating image', err);
			} else {
				console.log('Generated image', imageData.path.name)
			}
		});


	original.noProfile()
		.write(`./src/assets/generated/${imageData.path.name + i.suffix + imageData.path.ext}`, function (err) {
			if(err) {
				console.error('Error generating image', imageData.path.name, err);
			} else {
				console.log(`Copied to ./src/assets/generated/${imageData.path.name}`);
			}
		});
}


var produceImages = function () {
	if(imagesToGenerate.length > 0) {
		var imageData = imagesToGenerate[0];
		for (key in config.imagePresets) {
			generateImage(imageData, key);
		}
		fs.writeJson(`./src/assets/generated/${imageData.path.name}.json`, imageData);
		// pop [0] off the front
		imagesToGenerate.shift();
		produceImages();
	}
}

module.exports = {
	produce: function () {
		console.log('Started generating images');
		produceImages()
	},
	setImageData: setImageData
};