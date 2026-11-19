/* An orthographic view of a moving bolt, with material coordinates in cloth units. */
function createFabricRoll() {
 const surface = document.createElement('canvas');
 surface.width = innerWidth<=900 ? 480 : 960;
 surface.height = innerWidth<=900 ? 560 : 1120;
 const gl = surface.getContext('webgl2', {alpha:true, antialias:true, depth:true});
 if (!gl) return null;
 const vertex = `#version 300 es
 precision highp float;
 in vec2 grid;
 uniform int part;
 uniform float progress;
 out vec3 normal;
 out vec2 cloth;
 out float winding;
 const float tau=6.2831853;
 void main(){
   float radius=sqrt(mix(17.*17.,3.*3.,progress));
   float front=mix(96.,214.,progress);
   float spin=2.*118.*progress/(17.+radius);
   float angle=tau*grid.y;
   float axial=grid.x;
   if(part==2)axial=0.;
   if(part==3)axial=1.;
   // The relaxed knit compresses under its own weight and gathers along the selvedges.
   float loft=1.+.035*sin(axial*17.)+.018*sin(axial*39.);
   float wrap=1.+.045*sin(angle-spin+axial*.9);
   float rx=radius*1.36*loft*wrap;
   float rz=radius*.83*loft*wrap;
   vec3 p;
   winding=0.;
   if(part==0){
     float y=mix(72.,front,grid.y);
     float slack=sin(grid.y*3.14159)*(1.-progress);
     float wave=sin(grid.x*10.+grid.y*3.);
     p=vec3(28.+184.*grid.x,y,1.7*slack*wave);
     normal=normalize(vec3(-.09*slack*cos(grid.x*10.+grid.y*3.),0.,1.));
     cloth=p.xy;
   }else if(part==1){
     p=vec3(28.+184.*grid.x,front+rx*sin(angle),rz*(1.-cos(angle)));
     normal=vec3(0.,sin(angle),-cos(angle));
     cloth=vec2(p.x,front+(angle-spin)*radius);
   }else{
     float r=grid.x*radius;
     p=vec3(part==2?28.:212.,front+grid.x*rx*sin(angle),rz*(1.-grid.x*cos(angle)));
     normal=vec3(part==2?-1.:1.,0.,0.);
     cloth=vec2(r,angle-spin);
     winding=1.;
   }
   float tilt=1.-smoothstep(.78,1.,progress);
   float yaw=-.09*tilt,pitch=.13*tilt;
   vec3 q=p-vec3(120.,142.,0.);
   float x=q.x*cos(yaw)+q.z*sin(yaw);
   float z=q.z*cos(yaw)-q.x*sin(yaw);
   float y=q.y*cos(pitch)-z*sin(pitch);
   float depth=q.y*sin(pitch)+z*cos(pitch);
   gl_Position=vec4(x/120.,-(y+2.)/140.,-depth/200.,1.);
 }`;
 const fragment = `#version 300 es
 precision highp float;
 in vec3 normal;
 in vec2 cloth;
 in float winding;
 out vec4 pixel;
 float yarn(float x){return cos(x*6.2831853)*clamp(1.-fwidth(x),0.,1.);}
 void main(){
   vec2 uv=cloth*2.1;
   float light=.62+.45*dot(normalize(normal),normalize(vec3(.45,-.55,.8)));
   // Alternating diagonals form a small herringbone in warm, undyed linen.
   float direction=mod(floor(cloth.x/6.),2.)*2.-1.;
   float threads=.026*yarn((uv.y+direction*uv.x*.67)*.72)+.022*yarn(uv.x);
   float slub=.025*sin(cloth.x*.49+sin(cloth.y*.08))+.014*sin(cloth.y*.81);
   vec3 dye=vec3(.29,.30,.31);
   if(winding>.5){
     float rings=cloth.x/.93-cloth.y/6.2831853;
     threads=.085*yarn(rings);
     dye=mix(vec3(.13,.14,.15),dye,smoothstep(1.7,2.4,cloth.x));
   }
   pixel=vec4(dye*light+threads+slub,1.);
 }`;
 const program=gl.createProgram();
 for(const [kind,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
  const shader=gl.createShader(kind);
  gl.shaderSource(shader,source);gl.compileShader(shader);gl.attachShader(program,shader);
 }
 gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
 gl.useProgram(program);
 const vertices=[],indices=[],cols=36,rows=96;
 for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)vertices.push(x/cols,y/rows);
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
  const a=y*(cols+1)+x,b=a+cols+1;
  indices.push(a,b,a+1,b,b+1,a+1);
 }
 gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);
 const grid=gl.getAttribLocation(program,'grid');
 gl.enableVertexAttribArray(grid);gl.vertexAttribPointer(grid,2,gl.FLOAT,false,0,0);
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());
 gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
 gl.enable(gl.DEPTH_TEST);
 const part=gl.getUniformLocation(program,'part'),progress=gl.getUniformLocation(program,'progress');
 return (context,amount)=>{
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.uniform1f(progress,amount);
  for(let i=0;i<4;i++){
   gl.uniform1i(part,i);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
  }
  context.drawImage(surface,0,0,240,280);
 };
}
