"use strict";

var vertexshader_source = `#version 300 es

in vec2 a_position;

uniform vec2 u_resolution;

void main(){

  vec2 zerotoone = a_position/u_resolution;

  vec2 zerototwo = zerotoone * 2.0 ;

  vec2 clipSpace = zerototwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

}
`;

var fragmentshader_source = `#version 300 es

precision highp float;

uniform vec4 u_color;
out vec4 outColor;

void main(){
  outColor = u_color;
}
`;

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return undefined;
}

function createProgram(gl, vertexShader, fragmentShader) {
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
    return undefined;
}


function main() {
    var canvas = document.querySelector("#c");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexshader_source);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentshader_source);

    var program = createProgram(gl, vertexShader, fragmentShader);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
    var colorLocation = gl.getUniformLocation(program, "u_color");

    var positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positions = [
        10, 20,
        80, 20,
        10, 30,
        10, 30,
        80, 20,
        80, 30
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    var vao = gl.createVertexArray();

    gl.bindVertexArray(vao);

    gl.enableVertexAttribArray(positionAttributeLocation);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;

    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);  
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    gl.bindVertexArray(vao);

    for (var ii = 0; ii < 50; ++ii) {

        setRectangle(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300));

        gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;

        gl.drawArrays(primitiveType, offset, count);
    }

}

function randomInt(range){
  return Math.floor(Math.random()*range);
}

function setRectangle(gl, x, y, width, height){
  var x1 = x;
  var x2 = x+width;
  var y1 = y;
  var y2 = y+height;

  var position = [
  x1, y1,
  x2, y1,
  x1, y2,
  x1, y2,
  x2, y2,
  x2, y1
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);
}
main();