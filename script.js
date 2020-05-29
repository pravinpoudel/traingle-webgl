"use strict";
var vertexshader_source = `

#version 300es

in vec4 a_position;

void main(){

  gl_position = a_position
}

`;

var fragmentshader_source = `

#version 300es

precision highp float;

out vec4 outColor;

void main(){
  outColor = vec4(1,0,0.5,1);
}

`;

function createShader(gl, type, source){
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if(success){
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return undefined;
}

function createProgram(gl, vertexShader, fragmentShader){
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if(success){
    return program;
  }
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  return undefined;
}


function main(){
  var canvas = document.querySelector("#c");
  var gl = canvas.getContext("webgl2");
  if(!gl){
    return;
  }
  
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexshader_source);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentshader_source);
  
  var program = createProgram(gl, vertexShader, fragmentShader);
  
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  
  var positionBuffer = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  
  var positions = [
    0, 0,
    0, 0.5,
    0.7, 0
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW) ;
  
  var vao = gl.createVertexArray();
  
  gl.bindVertexArray(vao);
  
  gl.enableVertexAttribArray(positionAttributeLocation);
  
  var size = 2 ;
  var type = gl.FLOAT;
  var normalize = false;
  var stride = 0;
  var offset = 0;
  
  gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
  
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);
  
  gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
  
  gl.clearColor(0, 0, 0 , 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.useProgram(program);
  
  gl.bindVertexArray(vao);
  
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 3;
  
  gl.drawArrays(primitiveType, offset, count);
}
main();


