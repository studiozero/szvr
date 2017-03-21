
var voidSize = 50; // void is cubed e.g. voidSize = 200 = volume of 200x200x200
var foodDensity = 400; // number of food items in void
var tickSpeed = 300;
var birthThreshold = 100;
var names = ['Bob', 'Betty', 'Ben','Brian', 'Harriet', 'Blinky', 'Bernardette', 'Sam', 'Tina', 'Chrissy', 'Oswald', 'Anup', 'Carrie', 'Luke', 'Harrison', 'Mark', 'Calvin'];

var foods = [];
var blobs = [];
var world = document.querySelector('#world');
var aBlobs = document.querySelector('#blobs');
var aFood = document.querySelector('#food');


var tick = function () {
	render();
}


var distanceCalc = function (origin, target) {
	return Math.sqrt(
		Math.pow((origin.x - target.x), 2) +
		Math.pow((origin.y - target.y), 2) +
		Math.pow((origin.z - target.z), 2))
}

var bestMove = function (m, t, v) {
	if(m > t) {
		return 0-v;
	}
	if(m < t) {
		return v;
	}
	return 0;
};

var comparePos = function (origin, target, velocity = 1) {
	var resp = {
		towards : {x : 0, y : 0, z : 0},
		distance : 0
	}

	if(origin.x === target.x && origin.y === target.y && origin.z === target.z) {
		return resp;
	};

	resp.towards = {
		x : bestMove(origin.x, target.x, velocity),
		y : bestMove(origin.y, target.y, velocity),
		z : bestMove(origin.z, target.z, velocity)
	}
	resp.distance = distanceCalc(origin, target)
	return resp;
};

var Blob = function (params) {

	var chooseName = function () {
		var nameIndex = parseInt(Math.random() * (names.length -1), 10);
		return names[nameIndex];
	}


	var createElement = function () {
		var el = document.createElement('a-sphere');
		var ani = document.createElement('a-animation')
		el.appendChild(ani);
		el.setAttribute('geometry', {
			radius : 0.6
		});
		ani.setAttribute('attribute', 'position');
		ani.setAttribute('dur', tickSpeed);
		ani.setAttribute('fill', 'forwards');
		ani.setAttribute('to', status.position);
		ani.setAttribute('repeat', '0');
		ani.setAttribute('easing', 'ease-out');

		aBlobs.appendChild(el);
		//ani.setAttribute('attribute', 'position').setAttribute('from')
		el.setAttribute('color', status.color || 'black');
		return {
			blob : el,
			ani
		};
	}

	var status = Object.assign({
		alive : true,
		energy : 10,
		strength : 1,
		size : 1,
		speed : 1,
		position : params.position || {x : 10, y : 10, z : 10},
		name : chooseName() + ' ' + (params.color || 'smith'),
		target : false,
	}, params);

	status.el = createElement();

	var getVelocity = function () {
		if(status.energy < 10) {
			return 0.5
		}
		return 1;
	}

	var hunt = function (target) {
		if(!target) {
			return false;
		}
		var vector = comparePos(status.position, target.getPosition(), getVelocity());
		// deplete energy
		// now combine current position + vector
		var newPosition = {
			x : status.position.x + vector.towards.x,
			y : status.position.y + vector.towards.y,
			z : status.position.z + vector.towards.z
		}

		//console.log('Blob is', vector.distance, 'from food and energy is ', status.energy);
		if(vector.distance < 1) {
			// EATS THE FOOD (Assuming it's there)
			var dinner = foods.indexOf(target);
			status.energy = status.energy + target.isEaten(); // gets the energy
			console.info(status.name, 'just ate');
			foods.splice(dinner, 1);
		}
		return newPosition;
	}

	var findFood = function () {
		// dupe food list (no need to keep sorting it
		var tempFoods = foods.slice();

		tempFoods.sort(function (a, b) {
			var aD = distanceCalc(status.position, a.getPosition());
			var bD = distanceCalc(status.position, b.getPosition());
			if(aD < bD) {
				return -1;
			}
			if(aD > bD) {
				return 1;
			}
			return 0;
		});

		return tempFoods[0];
	};

	var getPosition = function (asString) {
		if(asString) {
			return `${status.position.x} ${status.position.y} ${status.position.z}`
		}
		return status.position;
	}

	var entity = function (el) {
		if(!el) {
			return status.el
		}
		status.el = el;
		return el;
	}

	var died = function () {
		status.el.blob.setAttribute('color', 'grey');
		console.info(status.name, 'died');
		status.alive = false;
	};

	var giveBirth = function () {

		if(status.energy > birthThreshold) {
			console.info(status.name, 'had a baby');

			blobs.push(Blob({
				position : {
					x : rando(),
					y : rando(),
					z : rando()},
				color : status.color,
			}));
			status.energy = status.energy / 2;
		}
	}

	var tick = function () {
		status.el.ani.setAttribute('from', getPosition(true));

		var nearestFood = findFood();
		var nextMove = hunt(nearestFood);

		if(status.alive) {

			status.energy = status.energy - 1;
			if(status.energy < 0) {
				died();
			}
			giveBirth();

			status.position = nextMove;
			status.el.ani.setAttribute('to', getPosition(true));
		}
	}

	var methods = {
		tick : tick
	}
	return methods;
};

var Food = function (params) {
	var isNew = true;

	var status = {
		size : 1,
		energy : 10,
		position : params.position || {x : 0, y : 0, z : 0}
	}

	var createElement = function () {
		var el = document.createElement('a-box');
		aFood.appendChild(el);
		el.setAttribute('geometry', {
			width: 0.3,
			height: 0.3,
			depth: 0.3
		});
		el.setAttribute('color', 'green');
		el.setAttribute('position', status.position);
		return el;
	}

	status.el = createElement()
	// every so often, I should reproduce
	var spawn = function () {
		if(Math.random() > 0.999) {
			foods.push(Food({position : {x : rando(), y : rando(), z : rando()}}));
		}
	};

	var isEaten = function () {
		status.el.parentNode.removeChild(status.el);
		return status.energy;
	}

	var getPosition = function () {
		return status.position;
	}

	var entity = function (el) {
		if(!el) {
			return status.el
		}
		status.el = el;
		return el;
	}

	var tick = function () {
		// do I even exist?
		spawn();
	}

	var methods = {
		isEaten,
		entity,
		tick,
		getPosition
	};

	return methods;
}

var render = function () {

	foods.forEach(function (nom) {
		nom.tick();
	})


	blobs.forEach(function (blb) {
		blb.tick();
	})
};




// NOT RANDOMLY GENERATED
//var Ba = Blob({position : {x : 2, y : 3, z : 0}, color : 'red'});
//var Bb = Blob({position : {x : 67, y : 22, z : -27}, color : 'yellow'});


var counter = 0;

var rando = function () {
	return parseInt((Math.random() * voidSize) - (voidSize/2), 10);
}

while(counter < foodDensity) {
	counter++;
	foods.push(Food({position : {x : rando(), y : rando(), z : rando()}}));
}

[
'red',
'yellow',
'blue',
'black',
'white',
'pink',
'black'].forEach(function (color) {

	blobs.push(Blob({position : {x : rando(), y : rando(), z : rando()}, color : color}));
})

var ticker = setInterval(function () {
	tick();
	if(foods.length <= 0) {
		window.clearInterval(ticker);
	}
}, tickSpeed);

