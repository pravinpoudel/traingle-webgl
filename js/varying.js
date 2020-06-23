"use strict";

var vs = `#version 300 es

precision highp float;

in vec2 a_position;
in vec4 a_color;

uniform vec2 u_resolution;

out vec4 v_color;

void main(){
    
    vec2 clipSpace = a_position/u_resolution;   

    // gl_Position = vec4(clipSpace*vec2(1, -1), 0, 1);

    gl_Position = vec4(clipSpace, 0, 1);

    v_color = a_color;
}
`;


var fs = `#version 300 es

precision highp float;

in  vec4 v_color;

out vec4 outColor;

void main(){
    outColor = v_color;
}
`;


function main() {
    var canvas = document.querySelector("#c");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    var program = webglUtils.createProgramFromSources(gl, [vs, fs]);

    var vertexPosition = gl.getAttribLocation(program, 'a_position');
    var vertexColor = gl.getAttribLocation(program, 'a_color');
    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    var position = [
          -150, -100,
           150, -100,
          -150,  100,
           150, -100,
          -150,  100,
           150,  100,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(position), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(vertexPosition);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;

    gl.vertexAttribPointer(vertexPosition, size, type, normalize, stride, offset);


    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    var color = [
        Math.random(), Math.random(), Math.random(), 1,
        Math.random(), Math.random(), Math.random(), 1,
        Math.random(), Math.random(), Math.random(), 1,
        Math.random(), Math.random(), Math.random(), 1,
        Math.random(), Math.random(), Math.random(), 1,
        Math.random(), Math.random(), Math.random(), 1
    ];

    console.log(color);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(color), gl.STATIC_DRAW);

    gl.enableVertexAttribArray(vertexColor);

    var size = 4;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;

    gl.vertexAttribPointer(vertexColor, size, type, normalize, stride, offset);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    gl.bindVertexArray(vao);

    var offset = 0;
    var count = 6;
    gl.drawArrays(gl.TRIANGLES, offset, count);

}

main();