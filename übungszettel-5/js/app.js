function App(options) {
	var that = this;

	this.running = false;
	this.time = 0;
	this.tempo = 1;

	this.width = window.innerWidth;
	this.height = window.innerHeight;

	this.scene = new THREE.Scene();
	this.scene.fog = new THREE.Fog(0xff0000, 100, 950);

	this.aspectRatio = this.width / this.height;
	this.fieldOfView = 60;
	this.nearPlane = 1;
	this.farPlane = 10000;
	this.camera = new THREE.PerspectiveCamera(
		this.fieldOfView, this.aspectRatio, this.nearPlane, this.farPlane);

	if (options.cameraPosition) {
		this.camera.position.add(options.cameraPosition);
	}

	this.renderer = new THREE.WebGLRenderer({
		alpha: true,
		antialias: true
	});

	this.renderer.setClearColor(0x000000);
	this.renderer.setSize(this.width, this.height);

	this.mouseDown = false;
	this.mouse = new THREE.Vector2();

	this.guiOptions = {};

	if (!options.container) {
		throw new Error('no container found');
	}

	var container;

	if (typeof options.container === 'string') {
		container = document.getElementById(options.container);
	}

	container.appendChild(this.renderer.domElement);

	container.addEventListener('mousemove', function(e) {
    that.onMouseMove(e);
  });

  container.addEventListener('mousedown', function() {
    that.mouseDown = true;
  });

  container.addEventListener('mouseup', function() {
    that.mouseDown = false;
  });

	window.addEventListener('resize', this.onWindowResize.bind(this), false);

	// stats
	this.stats = new Stats();
	this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

	if (!options.stats) {
		this.stats.hide();
	}

	document.body.appendChild(this.stats.dom);

	// datGui
  if (options.datGui) {
    this.datGui = new dat.GUI();
		this.datGuiVariables = [];

    this.updateDatGui(options.variables);
  }

	this.init(options);
}

App.prototype.init = function() {
	throw new Error('not implemented');
};

App.prototype.onWindowResize = function() {
	this.width = window.innerWidth;
	this.height = window.innerHeight;

	this.renderer.setSize(this.width, this.height);

	this.camera.aspect = this.width / this.height;
	this.camera.updateProjectionMatrix();
};

App.prototype.onMouseMove = function(e) {
	this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
};

App.prototype.start = function() {
	var that = this;

  this.running = true;

  function innerRun() {

    if (that.running) {
			that.stats.begin();

      that.update();
			that.render();

      that.time = that.time + that.tempo;

			that.stats.end();
    }

    requestAnimationFrame(innerRun);
  }

  innerRun();
};

App.prototype.stop = function() {
	this.running = false;
};

App.prototype.update = function() {
	throw new Error('not implemented');
};

App.prototype.render = function() {
	this.renderer.render(this.scene, this.camera);
};

App.prototype.updateDatGui = function(variables) {
	var that = this;

	this.datGui.destroy();
  this.datGui = new dat.GUI();

	// add default variables
	this.datGui.add(this, 'running').name('Play/Pause').listen();
	this.datGui.add(this, 'tempo', 0.25, 4).name('Tempo').listen();

	if (this.datGuiVariables) {
		this.datGuiVariables.forEach(function(variable) {
			delete that[variable];
		});
	}

	this.datGuiVariables = [];
	this.datGuiAnonymousFunctions = {};

  if (variables) {
		this._addVariablesToDatGui(variables);
  }
};

App.prototype._addVariablesToDatGui = function(variables, folder) {
	folder = folder || this.datGui;

	var that = this;

	variables.forEach(function(variable) {

		var anonymousFunctionName = undefined;

		if (variable.type === 'folder') {
			var subFolder = folder.addFolder(variable.name);

			that._addVariablesToDatGui(variable.variables, subFolder);
		} else {

			if (variable.variable) {
				that.datGuiVariables.push(variable.variable);
				that[variable.variable] = undefined;
			} else if (variable.function && typeof variable.function === 'function') {
				anonymousFunctionName = that.anonymousFunctionName();

				that.datGuiAnonymousFunctions[anonymousFunctionName] = variable.function;
			}

			if (variable.initial !== undefined) {
				that[variable.variable] = variable.initial;
			}

			var controller;

			switch (variable.type) {
				case 'boolean':
					controller = folder.add(that, variable.variable).listen();
					break;
				case 'number':
					controller = folder.add(that, variable.variable, variable.min, variable.max).listen();
					break;
				case 'dropdown':
					controller = folder.add(that, variable.variable, variable.options).listen();
					break;
				case 'function':

					if (typeof variable.function === 'function') {
						controller = folder.add(that.datGuiAnonymousFunctions, anonymousFunctionName);
					} else {
						controller = folder.add(that, variable.function);
					}
					break;
			}

			if (variable.step) {
				controller.step(variable.step);
			}

			if (variable.name) {
				controller.name(variable.name);
			}

			if (variable.onChange) {
				controller.onChange(variable.onChange.bind(that));
			}
		}
	});
};

App.prototype.anonymousFunctionName = function() {
	return 'function_' + Math.random().toString(36).substr(2, 9);
};
