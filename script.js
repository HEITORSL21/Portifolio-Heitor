(function () {
  // executa após DOM pronto
  window.addEventListener('DOMContentLoaded', () => {

    /* ===== Menu toggle mobile ===== */
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('menu');
    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
      });
      navMenu.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = document.getElementById(btn.dataset.target);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
          if (navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            menuToggle.classList.remove('open');
          }
        });
      });
    }

    /* ===== Fade-in ao scroll (IntersectionObserver) ===== */
    const faders = document.querySelectorAll('.fade-in');
    if ('IntersectionObserver' in window && faders.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      faders.forEach(f => observer.observe(f));
    } else {
      faders.forEach(f => f.classList.add('visible'));
    }

    /* ===== Scroll reveal com GSAP ===== */
    (function gsapReveal() {
      if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
      try { gsap.registerPlugin(ScrollTrigger); } catch (e) {}
      const textContainer = document.getElementById('scroll-reveal-text');
      if (!textContainer || textContainer.dataset.split === 'true') {
        if (textContainer) ScrollTrigger.refresh();
        return;
      }
      const raw = textContainer.textContent.trim();
      if (!raw) return;
      const words = raw.split(/\s+/).filter(Boolean);
      textContainer.innerHTML = words.map(w => `<span class="word">${w}&nbsp;</span>`).join('');
      textContainer.dataset.split = 'true';
      gsap.set('#scroll-reveal-text .word', { opacity: 0, y: 18, filter: 'blur(6px)' });
      gsap.to('#scroll-reveal-text .word', {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: textContainer,
          start: 'top 85%',
          end: 'bottom 60%',
          scrub: true,
          markers: false
        }
      });
      if (!window._gsapRevealResize) {
        window.addEventListener('resize', () => ScrollTrigger.refresh());
        window._gsapRevealResize = true;
      }
    })();

    /* ===== Partículas interativas ===== */
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let particles = [];
      const colors = ['#6c63ff','#00aaff','#ffffff'];
      function resizeCanvas(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
      window.addEventListener('resize', resizeCanvas);
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
        draw(){ ctx.beginPath(); ctx.arc(this.x,this.y,this.radius,0,Math.PI*2); ctx.fillStyle=this.color; ctx.fill(); }
        update(){
          this.x+=this.dx; this.y+=this.dy;
          if(this.x<0||this.x>canvas.width)this.dx*=-1;
          if(this.y<0||this.y>canvas.height)this.dy*=-1;
          this.draw();
        }
      }
      for(let i=0;i<150;i++) particles.push(new Particle());
      let mouse={x:null,y:null};
      window.addEventListener('mousemove',e=>{ mouse.x=e.x; mouse.y=e.y; });
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
    }
/*==== Fim partículas =====*/

/*==== Card 3d =====*/
(function(){
  const card = document.querySelector('#profile-card');
  if(!card) return;
  const tilt = card.querySelector('.card-tilt');

  const height = card.offsetHeight;
  const width = card.offsetWidth;

  // Tilt mouse
  tilt.addEventListener('mousemove', e=>{
    if(card.classList.contains('flipped')) return; // sem tilt quando flip
    const x = e.offsetX;
    const y = e.offsetY;
    const yRot = 15*((x-width/2)/width);
    const xRot = -15*((y-height/2)/height);
    tilt.style.transform = `rotateX(${xRot}deg) rotateY(${yRot}deg)`;
  });
  tilt.addEventListener('mouseleave', ()=>{
    tilt.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });

  // Flip touch/click
  const flipCard = () => card.classList.toggle('flipped');
  card.addEventListener('click', flipCard);
  card.addEventListener('touchstart', flipCard);
  /* ScrollReveal */
  if(typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined'){
    try{ gsap.registerPlugin(ScrollTrigger); }catch(e){}
    gsap.set(card, {opacity:0, y:18, filter:'blur(6px)'});
    gsap.to(card, {
      opacity:1, y:0, filter:'blur(0px)',
      ease:'power2.out',
      scrollTrigger:{ trigger: card, start:'top 85%', end:'bottom 60%', scrub:true }
    });
  }
})();

    /* ===== Carrossel + Modal ===== */
    (function () {
      const carouselContainer = document.getElementById('portfolio');
      if (!carouselContainer) return;
      const staticList = carouselContainer.querySelector('.static-projects');
      const dynamicContainer = carouselContainer.querySelector('.carousel-container');
      const track = carouselContainer.querySelector('#carousel-track');
      const dotsContainer = carouselContainer.querySelector('#dots-container');
      const prevBtn = carouselContainer.querySelector('.prev-btn');
      const nextBtn = carouselContainer.querySelector('.next-btn');

      const projects = Array.from(staticList.querySelectorAll('.static-card')).map(card => ({
        title: card.querySelector('h3')?.textContent ?? 'Sem título',
        description: card.querySelector('p')?.textContent ?? '',
        image: card.querySelector('img')?.src ?? '',
        url: card.querySelector('a')?.href ?? '#',
        tags: (card.querySelector('.tags')?.textContent ?? '').split(',').map(t => t.trim()).filter(Boolean)
      }));

      let currentIndex = 0;
      const totalSlides = projects.length;
      let cardsPerView = window.innerWidth>=1100?3:(window.innerWidth>=768?2:1);
      if(staticList) staticList.style.display='none';
      if(dynamicContainer) dynamicContainer.style.display='flex';

      // Modal
      function createModalDOM() {
        if (document.getElementById('project-modal-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'project-modal-overlay';
        overlay.innerHTML = `
          <div id="project-modal" role="dialog" aria-modal="true" aria-label="Detalhes do projeto" tabindex="-1">
            <div class="modal-image"><img src="" alt=""></div>
            <div class="modal-info">
              <h3></h3>
              <p class="modal-desc"></p>
              <span class="tags"></span>
              <div class="modal-actions">
                <button class="btn-modal-open">Abrir projeto</button>
                <button class="btn-modal-close">Fechar</button>
              </div>
            </div>
          </div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('click', e=>{ if(e.target===overlay) closeModal(); });
        overlay.querySelector('.btn-modal-close').addEventListener('click', closeModal);
        document.addEventListener('keydown', e=>{ if(e.key==='Escape' && overlay.classList.contains('open')) closeModal(); });
      }

      let previousFocus = null;
      function openModal(index) {
        createModalDOM();
        const overlay = document.getElementById('project-modal-overlay');
        const modal = overlay.querySelector('#project-modal');
        const project = projects[index];
        if(!project) return;
        modal.querySelector('.modal-image img').src = project.image;
        modal.querySelector('.modal-image img').alt = project.title;
        modal.querySelector('h3').textContent = project.title;
        modal.querySelector('.modal-desc').textContent = project.description;
        modal.querySelector('.tags').textContent = project.tags.join(' • ');
        modal.querySelector('.btn-modal-open').onclick = () => window.open(project.url,'_blank');
        overlay.classList.add('open');
        previousFocus = document.activeElement;
        modal.focus();
        trapFocus(modal);
      }
      function closeModal() {
        const overlay = document.getElementById('project-modal-overlay');
        if(!overlay) return;
        overlay.classList.remove('open');
        if(previousFocus && typeof previousFocus.focus==='function') previousFocus.focus();
      }
      function trapFocus(modal) {
        const focusable = modal.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
        if(!focusable.length) return;
        const first=focusable[0], last=focusable[focusable.length-1];
        function handleKey(e){
          if(e.key!=='Tab') return;
          if(e.shiftKey){ if(document.activeElement===first){ e.preventDefault(); last.focus(); } }
          else { if(document.activeElement===last){ e.preventDefault(); first.focus(); } }
        }
        modal.addEventListener('keydown', handleKey);
        const overlay = document.getElementById('project-modal-overlay');
        overlay.addEventListener('transitionend', function cleanup(){
          if(!overlay.classList.contains('open')){
            modal.removeEventListener('keydown', handleKey);
            overlay.removeEventListener('transitionend', cleanup);
          }
        });
      }

      // Render
      function renderSlides() {
        track.innerHTML='';
        projects.forEach((p,i)=>{
          const slide=document.createElement('div');
          slide.className='carousel-slide';
          slide.setAttribute('role','group');
          slide.setAttribute('aria-label',`${p.title} — slide ${i+1} de ${totalSlides}`);
          slide.setAttribute('tabindex','0');
          const card=document.createElement('div');
          card.className='card';
          card.innerHTML=`
            <img src="${p.image}" alt="${p.title}" loading="lazy"/>
            <div class="card-body">
              <h3>${p.title}</h3>
              <p>${p.description}</p>
              <span class="tags">${p.tags.join(', ')}</span>
            </div>
            <div style="height:8px"></div>
            <button class="project-btn" aria-label="Abrir ${p.title}">Ver detalhes</button>`;
          [card, card.querySelector('img'), card.querySelector('.project-btn')].forEach(el=>{
            el.addEventListener('click', e=>{ e.stopPropagation(); openModal(i); });
            el.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); openModal(i); } });
          });
          slide.appendChild(card);
          track.appendChild(slide);
        });
      }

      function renderDots() {
        dotsContainer.innerHTML='';
        projects.forEach((_,i)=>{
          const dot=document.createElement('button');
          dot.className='dot'; dot.setAttribute('aria-label',`Ir para slide ${i+1}`);
          dot.addEventListener('click',()=>goToSlide(i));
          if(i===0) dot.classList.add('active');
          dotsContainer.appendChild(dot);
        });
      }

      function updateCarousel() {
        const slideWidthPercent = 100/cardsPerView;
        const translateX = -currentIndex*slideWidthPercent;
        track.style.transform=`translateX(${translateX}%)`;
        track.querySelectorAll('.carousel-slide').forEach((s,i)=>s.classList.toggle('active',i===currentIndex));
        dotsContainer.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===currentIndex));
      }

      function goToSlide(i) {
        currentIndex=Math.max(0,Math.min(i,totalSlides-1));
        updateCarousel();
      }

      prevBtn?.addEventListener('click',()=>{ currentIndex=(currentIndex-1+totalSlides)%totalSlides; updateCarousel(); });
      nextBtn?.addEventListener('click',()=>{ currentIndex=(currentIndex+1)%totalSlides; updateCarousel(); });

      document.addEventListener('keydown',e=>{
        if(e.key==='ArrowLeft'){ currentIndex=Math.max(0,currentIndex-1); updateCarousel(); }
        if(e.key==='ArrowRight'){ currentIndex=Math.min(totalSlides-1,currentIndex+1); updateCarousel(); }
      });

      // Tilt efeito
      function setupTilt(){
        track.querySelectorAll('.carousel-slide').forEach(slide=>{
          const card=slide.querySelector('.card');
          slide.addEventListener('mousemove',e=>{
            const rect=slide.getBoundingClientRect();
            const x=(e.clientX-rect.left)/rect.width;
            const y=(e.clientY-rect.top)/rect.height;
            card.style.transform=`rotateY(${(x-0.5)*18}deg) rotateX(${-(y-0.5)*12}deg) translateZ(8px)`;
          });
          slide.addEventListener('mouseleave',()=>{ card.style.transform=''; });
        });
      }

      // Resize
      window.addEventListener('resize',()=>{
        cardsPerView = window.innerWidth>=1100?3:(window.innerWidth>=768?2:1);
        currentIndex=Math.min(currentIndex,totalSlides-1);
        updateCarousel();
      });

      renderSlides();
      renderDots();
      updateCarousel();
      setupTilt();
    })();

    // fecha menu mobile ao clicar em links (<a>) do nav
const navLinks = document.querySelectorAll('#menu a');
navLinks.forEach(a => a.addEventListener('click', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('menu');
  if (navMenu?.classList.contains('open')) {
    navMenu.classList.remove('open');
    menuToggle?.classList.remove('open');
  }
}));

  }); // end DOMContentLoaded
})();
