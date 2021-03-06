import dF from './default.frag';
import dV from './default.vert';
export let gl = {
	init(s) {
		let canvas = s;
		gl = Object.assign(canvas.getContext("webgl"), gl);
		gl.resize();
		gl.clearColor(0,0,0,0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.buffers.positions = gl.createBuffer();
		gl.buffers.colors = gl.createBuffer();
		
		gl.default = gl.buildProgram(dV, dF);

		gl.useProgram(gl.default);

		var positionAttributeLocation = gl.getAttribLocation(gl.default, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffers.positions);
		gl.enableVertexAttribArray(positionAttributeLocation);
		
		// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
		var size = 2;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

	},
	resize() {
		//make the canvas size the same size it is in pixels
		gl.canvas.width = Math.floor(gl.canvas.clientWidth  * window.devicePixelRatio);
		gl.canvas.height = Math.floor(gl.canvas.clientHeight * window.devicePixelRatio);
		//gl.canvas.width -= gl.canvas.width % 2 == 0 ? 0 : 1;
		//gl.canvas.height -= gl.canvas.height % 2 == 0 ? 0 : 1;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	},
	buildShader(type, source) {
		let shader = gl.createShader(type);
		
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) {
			return shader;
		}
	
		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	},
	buildProgram(vertexShader, fragmentShader) {

		vertexShader = gl.buildShader(gl.VERTEX_SHADER, vertexShader);
		fragmentShader = gl.buildShader(gl.FRAGMENT_SHADER, fragmentShader);
		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		var success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) {
		  return program;
		}
	   
		console.log(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
		
	},
	vertexBuffer:[],
	colorBuffer:[],
	buffers:{}
};