// 'use strict';
// const canvas = document.querySelector('#c');
// const gl = canvas.getContext('webgl2');

const makeTextCanvas = (text, width, height, color) => {
    const element = document.createElement('canvas');
    const context = element.getContext('2d')
    context.canvas.width = width
    context.canvas.height = height
    context.font = `bold ${height * 5/6 | 0}px sans-serif`
    context.font = '48px serif'
    context.textAlign = 'center'
    context.baseAlign = 'middle'
    context.fillStyle = color
    context.fillText(text, width / 2, height / 2);
    document.body.appendChild(element);
    return context.canvas
}

var vsGLSL = `#version 300 es
in vec4 position;
in vec3 normal;
in vec2 texcoord;

uniform mat4 projection;
uniform mat4 modelView;

out vec3 v_normal;
out vec2 v_texcoord;

void main(){
	gl_Position = projection*modelView*position;
	v_normal = mat3(modelView)*normal;
	v_texcoord = texcoord;
}
`;


const fsGLSL = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec2 v_texcoord;

uniform sampler2D diffuse;
uniform sampler2D decal;
uniform vec4 diffuseMult;
uniform vec3 lightDir;

out vec4 outColor;

void main() {
    vec3 normal = normalize(v_normal);
    float light = dot(normal, lightDir) * 0.5 + 0.5;
    vec4 color = texture(diffuse, v_texcoord) * diffuseMult;
    vec4 decalColor = texture(decal, v_texcoord);
    decalColor.rgb *= decalColor.a;
    color = color * (1.0 - decalColor.a) + decalColor; 
    outColor = vec4(color.rgb * light, color.a);
}
`;

function main() {

    var canvas = document.querySelector("#c");
    var gl = canvas.getContext('webgl2');
    if (!gl) {
        return;
    }
    var program = webglUtils.createProgramFromSources(gl, [vsGLSL, fsGLSL]);

    const positionLoc = gl.getAttribLocation(program, 'position');
    const normalLoc = gl.getAttribLocation(program, 'normal');
    const texcoordLoc = gl.getAttribLocation(program, 'texcoord');
    const projectionLoc = gl.getUniformLocation(program, 'projection');
    const modelViewLoc = gl.getUniformLocation(program, 'modelView');
    const diffuseLoc = gl.getUniformLocation(program, 'diffuse');
    const decalLoc = gl.getUniformLocation(program, 'decal');
    const diffuseMultLoc = gl.getUniformLocation(program, 'diffuseMult');
    const lightDirLoc = gl.getUniformLocation(program, 'lightDir');

    const cubeVertexPositions = new Float32Array([
        1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1,
    ]);

    const cubeVertexNormals = new Float32Array([
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    ]);

    const cubeVertexTexcoord = new Float32Array([
        1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1,

    ]);

    const cubeVertexIndices = new Uint16Array([
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,

    ],);

    const cubeVertexArray = gl.createVertexArray();
    gl.bindVertexArray(cubeVertexArray);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexPositions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexNormals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalLoc);
    gl.vertexAttribPointer(
    	normalLoc,
    	3,
    	gl.FLOAT,
    	false,
    	0,
    	0
    );

    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertexTexcoord, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texcoordLoc);
    gl.vertexAttribPointer(
    	texcoordLoc,
    	2,
    	gl.Float,
    	false,
    	0,
    	0
    	);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndices, gl.STATIC_DRAW);

    
}

main();





makeTextCanvas('Hello', 122, 122, 'blue');