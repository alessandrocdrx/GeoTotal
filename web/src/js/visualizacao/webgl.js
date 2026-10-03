/**
 * @arquivo js/visualizacao/webgl.js
 * Camada: Visualização
 * Esfera texturizada em WebGL.
 */
/* ---------- WebGL: esfera com textura ---------- */
function initGL(){
  try{gl=glc.getContext('webgl',{alpha:true,premultipliedAlpha:true,antialias:false});}catch(e){gl=null;}
  if(!gl)return false;
  var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
  var fs='#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n'+
  'uniform sampler2D uT;uniform vec2 uC;uniform float uR;uniform float uH;uniform vec4 uRot;uniform vec3 uSun;uniform float uNight;\n'+
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
  ' float dv=x*uSun.x+y*uSun.y+z*uSun.z;\n'+
  ' float dayf=smoothstep(-0.08,0.14,dv);\n'+
  ' c*=mix(1.0,mix(0.13,1.0,dayf),uNight);\n'+
  ' float d=max(0.0,dot(vec3(nx,ny,nz),normalize(vec3(-0.35,0.45,0.82))));\n'+
  ' c*=0.60+0.58*d;\n'+
  ' float rim=pow(1.0-nz,2.8);\n'+
  ' c=mix(c,vec3(0.30,0.56,1.0),rim*0.7);\n'+
  ' float a=clamp((1.0-sqrt(r2))*uR,0.0,1.0);\n'+
  ' gl_FragColor=vec4(c*a,a);\n'+
  '}';
  function sh(t,src){var s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(s));return null;}return s;}
  var v=sh(gl.VERTEX_SHADER,vs),f=sh(gl.FRAGMENT_SHADER,fs);
  if(!v||!f)return false;
  glProg=gl.createProgram();gl.attachShader(glProg,v);gl.attachShader(glProg,f);gl.linkProgram(glProg);
  if(!gl.getProgramParameter(glProg,gl.LINK_STATUS))return false;
  gl.useProgram(glProg);
  glBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,glBuf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(glProg,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  ['uT','uC','uR','uH','uRot','uSun','uNight'].forEach(function(n){glU[n]=gl.getUniformLocation(glProg,n);});
  return true;
}
function uploadTexture(cvs){
  if(glTex)gl.deleteTexture(glTex);
  glTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,glTex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cvs);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  return !gl.getError();
}
function glDraw(tex,R,cx,cy){
  if(!gl)return;
  gl.viewport(0,0,glc.width,glc.height);
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
  if(!tex)return;
  gl.useProgram(glProg);gl.bindBuffer(gl.ARRAY_BUFFER,glBuf);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,glTex);
  gl.uniform1i(glU.uT,0);
  gl.uniform2f(glU.uC,cx*dpr,cy*dpr);
  gl.uniform1f(glU.uR,R*dpr);
  gl.uniform1f(glU.uH,glc.height);
  gl.uniform4f(glU.uRot,Math.cos(lam),Math.sin(lam),Math.cos(phi),Math.sin(phi));
  var sv=sunVec();gl.uniform3f(glU.uSun,sv[0],sv[1],sv[2]);gl.uniform1f(glU.uNight,optNight?1:0);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}

