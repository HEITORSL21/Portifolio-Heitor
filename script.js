// Menu toggle mobile
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('open');
  navMenu.classList.toggle('open');
});

navMenu.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.target).scrollIntoView({ behavior: 'smooth' });
    // fecha menu no mobile
    if (navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      menuToggle.classList.remove('open');
    }
  });
});

// Scroll fade-in
const faders = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');}
  });
},{threshold:0.2});
faders.forEach(fader=>observer.observe(fader));

// Partículas interativas
const canvas=document.getElementById('particle-canvas');
const ctx=canvas.getContext('2d');
let particles=[];
const colors=['#6c63ff','#00aaff','#ffffff'];
function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
window.addEventListener('resize',resizeCanvas);
resizeCanvas();

class Particle{
  constructor(){
    this.x=Math.random()*canvas.width;
    this.y=Math.random()*canvas.height;
    this.radius=Math.random()*2+1;
    this.color=colors[Math.floor(Math.random()*colors.length)];
    this.dx=(Math.random()-0.5)*1.5;
    this.dy=(Math.random()-0.5)*1.5;
  }
  draw(){
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
    ctx.fillStyle=this.color;
    ctx.fill();
  }
  update(){
    this.x+=this.dx;
    this.y+=this.dy;
    if(this.x<0||this.x>canvas.width)this.dx*=-1;
    if(this.y<0||this.y>canvas.height)this.dy*=-1;
    this.draw();
  }
}
for(let i=0;i<150;i++)particles.push(new Particle());
let mouse={x:null,y:null};
window.addEventListener('mousemove',e=>{
  mouse.x=e.x; mouse.y=e.y;
});
function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.update();
    if(mouse.x && Math.hypot(p.x-mouse.x,p.y-mouse.y)<100){
      ctx.beginPath();
      ctx.moveTo(p.x,p.y);
      ctx.lineTo(mouse.x,mouse.y);
      ctx.strokeStyle='rgba(108,99,255,0.2)';
      ctx.stroke();
    }
  });
  requestAnimationFrame(animate);
}
animate();
