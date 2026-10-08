/**
 * @arquivo js/visualizacao/webgl.js
 * Camada: Visualização
 * Esfera texturizada em WebGL.
 */

import { optNight, sunVec } from './dia-noite.js';
import { estadoRender } from './projecao.js';
import { dpr, estadoCamera, glc } from './tela.js';

/* ---------- WebGL: esfera com textura ---------- */
function initGL(){
  try{estadoRender.gl=glc.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false});}catch(e){estadoRender.gl=null;}
  if(!estadoRender.gl)return false;
  var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
  var fs='#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n'+
  'uniform sampler2D uT;uniform vec2 uC;uniform float uR;uniform float uH;uniform vec4 uRot;uniform vec3 uSun;uniform float uNight;uniform float uToon;\n'+
  /* ruído 3D sem seno (estável em GPUs de celular), para o relevo fino que aparece ao aproximar */
  'float h3(vec3 p){p=fract(p*0.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}\n'+
  'float vn3(vec3 p){vec3 i=floor(p);vec3 f=fract(p);f=f*f*(3.0-2.0*f);\n'+
  ' return mix(mix(mix(h3(i),h3(i+vec3(1.0,0.0,0.0)),f.x),mix(h3(i+vec3(0.0,1.0,0.0)),h3(i+vec3(1.0,1.0,0.0)),f.x),f.y),\n'+
  '            mix(mix(h3(i+vec3(0.0,0.0,1.0)),h3(i+vec3(1.0,0.0,1.0)),f.x),mix(h3(i+vec3(0.0,1.0,1.0)),h3(i+vec3(1.0,1.0,1.0)),f.x),f.y),f.z);}\n'+
  'void main(){\n'+
  ' vec2 q=(vec2(gl_FragCoord.x,uH-gl_FragCoord.y)-uC)/uR;\n'+
  ' float nx=q.x;float ny=-q.y;float r2=nx*nx+ny*ny;\n'+
  ' if(r2>=1.0){gl_FragColor=vec4(0.0);return;}\n'+
  ' float nz=sqrt(1.0-r2);\n'+
  ' float cL=uRot.x;float sL=uRot.y;float cP=uRot.z;float sP=uRot.w;\n'+
  ' float y=ny*cP+nz*sP;float z1=-ny*sP+nz*cP;\n'+
  ' float x=nx*cL+z1*sL;float z=-nx*sL+z1*cL;\n'+
  ' float lat=asin(clamp(y,-1.0,1.0));float lng=atan(x,z);\n'+
  ' vec2 uv=vec2(lng/6.28318531+0.5,0.5-lat/3.14159265);\n'+
  ' vec3 c=texture2D(uT,uv).rgb;\n'+
  /* a textura tem pouca resolução: de perto, um relevo procedural dá detalhe à terra. Cada oitava
     só entra quando seus detalhes têm alguns pixels na tela (sem cintilar de longe). */
  ' float land=1.0-smoothstep(0.10,0.22,c.b-c.r);\n'+
  ' vec3 sp=vec3(x,y,z);float det=0.0;float amp=0.55;float fq=70.0;\n'+
  ' for(int i=0;i<4;i++){float w=smoothstep(3.0,8.0,uR/fq);if(w>0.0)det+=w*amp*(vn3(sp*fq)-0.5);fq*=2.9;amp*=0.6;}\n'+
  ' c*=1.0+det*(land*0.62+0.06)*(1.0-uToon);\n'+
  ' float dv=x*uSun.x+y*uSun.y+z*uSun.z;\n'+
  ' float dayf=smoothstep(-0.08,0.14,dv);\n'+
  ' c*=mix(1.0,mix(0.32,1.0,dayf),uNight);\n'+
  ' float d=max(0.0,dot(vec3(nx,ny,nz),normalize(vec3(-0.35,0.45,0.82))));\n'+
  ' c*=mix(0.60+0.58*d,0.84+0.24*d,uToon);\n'+
  ' float rim=pow(1.0-nz,2.8);\n'+
  ' c=mix(c,vec3(0.30,0.56,1.0),rim*0.7);\n'+
  ' float a=clamp((1.0-sqrt(r2))*uR,0.0,1.0);\n'+
  ' gl_FragColor=vec4(c*a,a);\n'+
  '}';
  function sh(t,src){var s=estadoRender.gl.createShader(t);estadoRender.gl.shaderSource(s,src);estadoRender.gl.compileShader(s);if(!estadoRender.gl.getShaderParameter(s,estadoRender.gl.COMPILE_STATUS)){console.warn(estadoRender.gl.getShaderInfoLog(s));return null;}return s;}
  var v=sh(estadoRender.gl.VERTEX_SHADER,vs),f=sh(estadoRender.gl.FRAGMENT_SHADER,fs);
  if(!v||!f)return false;
  estadoRender.glProg=estadoRender.gl.createProgram();estadoRender.gl.attachShader(estadoRender.glProg,v);estadoRender.gl.attachShader(estadoRender.glProg,f);estadoRender.gl.linkProgram(estadoRender.glProg);
  if(!estadoRender.gl.getProgramParameter(estadoRender.glProg,estadoRender.gl.LINK_STATUS))return false;
  estadoRender.gl.useProgram(estadoRender.glProg);
  estadoRender.glBuf=estadoRender.gl.createBuffer();estadoRender.gl.bindBuffer(estadoRender.gl.ARRAY_BUFFER,estadoRender.glBuf);
  estadoRender.gl.bufferData(estadoRender.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),estadoRender.gl.STATIC_DRAW);
  var loc=estadoRender.gl.getAttribLocation(estadoRender.glProg,'p');estadoRender.gl.enableVertexAttribArray(loc);estadoRender.gl.vertexAttribPointer(loc,2,estadoRender.gl.FLOAT,false,0,0);
  ['uT','uC','uR','uH','uRot','uSun','uNight','uToon'].forEach(function(n){glU[n]=estadoRender.gl.getUniformLocation(estadoRender.glProg,n);});
  return true;
}
function uploadTexture(cvs){
  if(estadoRender.glTex)estadoRender.gl.deleteTexture(estadoRender.glTex);
  estadoRender.glTex=estadoRender.gl.createTexture();estadoRender.gl.bindTexture(estadoRender.gl.TEXTURE_2D,estadoRender.glTex);
  estadoRender.gl.pixelStorei(estadoRender.gl.UNPACK_FLIP_Y_WEBGL,false);
  estadoRender.gl.texImage2D(estadoRender.gl.TEXTURE_2D,0,estadoRender.gl.RGBA,estadoRender.gl.RGBA,estadoRender.gl.UNSIGNED_BYTE,cvs);
  estadoRender.gl.texParameteri(estadoRender.gl.TEXTURE_2D,estadoRender.gl.TEXTURE_MIN_FILTER,estadoRender.gl.LINEAR);
  estadoRender.gl.texParameteri(estadoRender.gl.TEXTURE_2D,estadoRender.gl.TEXTURE_MAG_FILTER,estadoRender.gl.LINEAR);
  estadoRender.gl.texParameteri(estadoRender.gl.TEXTURE_2D,estadoRender.gl.TEXTURE_WRAP_S,estadoRender.gl.REPEAT);
  estadoRender.gl.texParameteri(estadoRender.gl.TEXTURE_2D,estadoRender.gl.TEXTURE_WRAP_T,estadoRender.gl.CLAMP_TO_EDGE);
  return !estadoRender.gl.getError();
}
function glDraw(tex,R,cx,cy){
  if(!estadoRender.gl)return;
  estadoRender.gl.viewport(0,0,glc.width,glc.height);
  estadoRender.gl.clearColor(0,0,0,0);estadoRender.gl.clear(estadoRender.gl.COLOR_BUFFER_BIT);
  if(!tex)return;
  estadoRender.gl.useProgram(estadoRender.glProg);estadoRender.gl.bindBuffer(estadoRender.gl.ARRAY_BUFFER,estadoRender.glBuf);
  estadoRender.gl.activeTexture(estadoRender.gl.TEXTURE0);estadoRender.gl.bindTexture(estadoRender.gl.TEXTURE_2D,estadoRender.glTex);
  estadoRender.gl.uniform1i(glU.uT,0);
  estadoRender.gl.uniform2f(glU.uC,cx*dpr,cy*dpr);
  estadoRender.gl.uniform1f(glU.uR,R*dpr);
  estadoRender.gl.uniform1f(glU.uH,glc.height);
  estadoRender.gl.uniform4f(glU.uRot,Math.cos(estadoCamera.lam),Math.sin(estadoCamera.lam),Math.cos(estadoCamera.phi),Math.sin(estadoCamera.phi));
  var sv=sunVec();estadoRender.gl.uniform3f(glU.uSun,sv[0],sv[1],sv[2]);estadoRender.gl.uniform1f(glU.uNight,optNight&&!estadoRender.cartoon?1:0);estadoRender.gl.uniform1f(glU.uToon,estadoRender.cartoon?1:0);
  estadoRender.gl.drawArrays(estadoRender.gl.TRIANGLE_STRIP,0,4);
}

const glU = {};

export { glDraw, initGL, uploadTexture };
