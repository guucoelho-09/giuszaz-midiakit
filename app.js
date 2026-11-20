(async function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = await fetch('content/site.json', {cache:'no-store'}).then(function(r){return r.json();});
  var $ = function(id){return document.getElementById(id);};
  var esc = function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
  var get = function(path){return path.split('.').reduce(function(o,k){return o&&o[k];},C);};
  document.querySelectorAll('[data-k]').forEach(function(el){el.textContent = get(el.dataset.k) || '';});

  // foto com tamanho e posição vindos do painel
  function photo(img, f){
    img.src = f.src;
    img.style.setProperty('--s', (f.tamanho||100)/100);
    img.style.setProperty('--x', (f.x||0)+'px');
    img.style.setProperty('--y', (f.y||0)+'px');
  }

  // capa
  photo($('heroImg'), C.hero.foto);
  $('heroFacts').innerHTML = C.hero.numeros.map(function(n){
    return '<div><svg class="ic"><use href="#i-'+esc(n.icone)+'"/></svg><b>'+esc(n.valor)+'</b>'+esc(n.rotulo)+'</div>';
  }).join('');
  var stk = ['s1','s2 glass','s3','s4 glass'];
  $('stickers').innerHTML = C.hero.etiquetas.slice(0,4).map(function(t,i){return '<span class="sticker '+stk[i]+'">'+esc(t)+'</span>';}).join('');

  // publis em vídeo
  function reel(v){
    return '<div class="reel"><video src="'+esc(v.video)+'" poster="'+esc(v.capa)+'" muted loop playsinline preload="metadata" aria-label="Publi '+esc(v.marca)+'"></video><span>'+esc(v.marca)+'</span></div>';
  }
  $('t1').innerHTML = C.publis.videos.map(reel).join('') + C.publis.videos.map(reel).join('');
  var vio = new IntersectionObserver(function(es){es.forEach(function(e){
    if(reduce) return;
    if(e.isIntersecting){ var p=e.target.play(); if(p&&p.catch) p.catch(function(){}); } else e.target.pause();
  });},{threshold:.2});
  document.querySelectorAll('.reel video').forEach(function(v){vio.observe(v);});

  // números
  var nf = C.numeros.foto;
  photo($('numImg'), nf); $('numImg').alt = nf.legenda; $('numCap').textContent = nf.legenda;
  $('aud').innerHTML = C.numeros.publico.map(function(p){
    return '<div><svg class="ic"><use href="#i-'+esc(p.icone)+'"/></svg><div class="v">'+esc(p.valor)+'</div><div class="k">'+esc(p.texto)+'</div><div class="bar"><i data-w="'+(+p.barra||0)+'"></i></div></div>';
  }).join('');

  // destaques
  var items = C.destaques.itens;
  $('slides').innerHTML = items.map(function(d,i){
    return '<article class="slide" aria-label="Destaque '+(i+1)+' de '+items.length+'"><div class="card glass"><div>'+
      '<span class="tagline"><svg class="ic" style="width:18px;height:18px"><use href="#i-play"/></svg>'+esc(d.etiqueta)+'</span>'+
      '<h2 class="disp">'+esc(d.titulo)+'</h2>'+
      '<div class="n">'+esc(d.views)+'<small>'+esc(d.unidade)+'</small></div>'+
      '<div class="facts">'+d.dados.map(function(x){return '<div><b>'+esc(x.valor)+'</b><span>'+esc(x.legenda)+'</span></div>';}).join('')+'</div>'+
      '</div><a class="phone" href="'+esc(d.link)+'" target="_blank" rel="noopener">'+(d.video?'<video src="'+esc(d.video)+'" poster="'+esc(d.capa)+'" muted loop playsinline preload="metadata" aria-label="Reel: '+esc(d.titulo)+'"></video>':'<img src="'+esc(d.capa)+'" alt="Capa do Reel: '+esc(d.titulo)+'" loading="lazy">')+
      '<span><svg class="ic"><use href="#i-insta"/></svg>Ver no Instagram</span></a></div></article>';
  }).join('');
  $('dots').innerHTML = items.map(function(_,i){return '<button type="button" aria-label="Ir para o destaque '+(i+1)+'"></button>';}).join('');
  var sl = $('slides'), dots = $('dots').children;
  function cur(){ return Math.round(sl.scrollLeft / (sl.children[0].getBoundingClientRect().width + 18)); }
  function sync(){ var c=cur(); for(var i=0;i<dots.length;i++) dots[i].setAttribute('aria-current', i===c); $('prev').disabled = c===0; $('next').disabled = c===items.length-1; }
  function go(i){ i=Math.max(0,Math.min(items.length-1,i)); sl.scrollTo({left: sl.children[i].offsetLeft - sl.children[0].offsetLeft, behavior: reduce?'auto':'smooth'}); }
  $('prev').onclick = function(){go(cur()-1);}; $('next').onclick = function(){go(cur()+1);};
  [].forEach.call(dots,function(b,i){b.onclick=function(){go(i);};});
  sl.addEventListener('scroll', function(){ requestAnimationFrame(sync); }, {passive:true});
  sl.addEventListener('keydown', function(e){ if(e.key==='ArrowRight'){e.preventDefault();go(cur()+1);} if(e.key==='ArrowLeft'){e.preventDefault();go(cur()-1);} });
  sync();
  document.querySelectorAll('.phone video').forEach(function(v){vio.observe(v);});

  // marcas
  var logos = C.marcas.logos, half = Math.ceil(logos.length/2);
  function lg(list){return list.map(function(l){return '<div class="logo"><img src="'+esc(l.src)+'" alt="'+esc(l.nome)+'" loading="lazy"></div>';}).join('');}
  var a = logos.slice(0,half), b = logos.slice(half);
  $('l1').innerHTML = lg(a)+lg(a)+lg(a); $('l2').innerHTML = lg(b)+lg(b)+lg(b);

  // mídia
  $('midia').innerHTML = C.midia.itens.map(function(m,i){
    return '<figure class="glass"><button type="button" data-i="'+i+'" aria-label="Assistir: Giu em '+esc(m.nome)+'"><img src="'+esc(m.src)+'" alt="" loading="lazy"><span class="play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span><figcaption>'+esc(m.nome)+'<span>'+esc(m.tipo)+'</span></figcaption></button></figure>';
  }).join('');
  // abre o vídeo na própria página, já no minuto marcado no link
  function embed(link){
    var u; try{ u=new URL(link); }catch(e){ return null; }
    var t = parseInt((u.searchParams.get('t')||'0').replace(/s$/,''),10)||0, id='';
    if(/youtu\.be$/.test(u.hostname)) id=u.pathname.slice(1);
    else if(/youtube\.com$/.test(u.hostname)){ id=u.searchParams.get('v') || (u.pathname.match(/\/(live|shorts|embed)\/([^/?]+)/)||[])[2] || ''; }
    if(id) return {src:'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&start='+t, vert:/shorts/.test(u.pathname)};
    var ig = u.pathname.match(/\/(reel|p)\/([^/]+)/);
    if(/instagram\.com$/.test(u.hostname) && ig) return {src:'https://www.instagram.com/'+ig[1]+'/'+ig[2]+'/embed/', vert:true};
    return null;
  }
  var dlg=$('player'), frame=$('frame'), lastBtn=null;
  function closePlayer(){ frame.innerHTML=''; if(dlg.open) dlg.close(); if(lastBtn) lastBtn.focus(); }
  $('midia').addEventListener('click', function(e){
    var b=e.target.closest('button[data-i]'); if(!b) return;
    var m=C.midia.itens[+b.dataset.i], em=embed(m.link||'');
    if(!em){ if(m.link) window.open(m.link,'_blank','noopener'); return; }
    lastBtn=b; frame.className='frame'+(em.vert?' vert':'');
    frame.innerHTML='<iframe src="'+esc(em.src)+'" title="Giu em '+esc(m.nome)+'" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    dlg.showModal();
  });
  $('closePlayer').onclick=closePlayer;
  dlg.addEventListener('click', function(e){ if(e.target===dlg) closePlayer(); });
  dlg.addEventListener('cancel', function(e){ e.preventDefault(); closePlayer(); });

  // contato
  photo($('ctImg'), C.contato.foto);
  function redes(cls){ return (C.redes||[]).map(function(r){return '<a class="'+cls+'" href="'+esc(r.link)+'" target="_blank" rel="noopener" aria-label="'+esc(r.nome)+' da Giu"><svg class="ic"><use href="#i-'+esc(r.icone)+'"/></svg>'+esc(r.nome)+'</a>';}).join(''); }
  $('heroSocial').innerHTML = redes(''); $('ftSocial').innerHTML = redes(''); $('ctSocial').innerHTML = redes('btn o');
  $('copy').onclick = function(){
    var out=$('copied'), mail=C.contato.email;
    var p = navigator.clipboard&&navigator.clipboard.writeText ? navigator.clipboard.writeText(mail) : Promise.reject();
    p.then(function(){out.textContent='E-mail copiado: '+mail;}).catch(function(){out.textContent='Copie o e-mail acima: '+mail;});
  };

  // título gigante ajustado à largura
  var wm=$('wm'), word=wm.parentNode;
  function fit(){
    var target = innerWidth<=820 ? word.clientWidth-32 : innerWidth*0.58;
    wm.style.fontSize='100px'; wm.style.fontSize=(100*target/wm.getBoundingClientRect().width)+'px';
  }
  fit(); if(document.fonts) document.fonts.ready.then(fit); addEventListener('resize',fit);
  wm.querySelectorAll('span').forEach(function(s,i){s.style.transitionDelay=(i*0.05)+'s';});
  requestAnimationFrame(function(){setTimeout(function(){document.body.classList.add('ready');},60);});

  // barras do público
  var io = new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting) return;
    e.target.querySelectorAll('.bar i').forEach(function(b){b.style.width=b.dataset.w+'%';});
    io.unobserve(e.target);
  });},{threshold:.3});
  io.observe(document.querySelector('.bento'));

  // leve parallax na capa
  var giu=$('giu'), live=false;
  setTimeout(function(){live=true;giu.style.transition='none';},1700);
  addEventListener('scroll',function(){
    if(reduce||!live||innerWidth<=820) return;
    var y=scrollY; if(y>innerHeight*1.2) return;
    giu.style.transform='translateY('+(y*-0.12)+'px)';
    word.style.transform='translateY('+(y*0.18)+'px)';
  },{passive:true});
})();
