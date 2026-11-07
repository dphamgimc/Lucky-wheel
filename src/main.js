import './style.css';
import '@fontsource-variable/noto-sans';
import '@fontsource/noto-serif/400.css';
import '@fontsource/noto-serif/600.css';
import '@fontsource/noto-serif/700.css';
import '@fontsource/noto-serif/800.css';
import './themes.css';
import { parseNames, chooseEntry, removeEntry, secureRandom } from './wheel.js';
import { themes, resolveTheme, pointerColor } from './themes.js';

const defaults = 'Bé Hồng\nBé Linh\nDuy đẹp zai\nDì Hương\nChụy Cẩm';
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
let history = read('lucky-history', []);
if (!Array.isArray(history)) history = [];
history = history.filter(x => x && typeof x.name === 'string' && typeof x.time === 'string');
let saved = read('lucky-names', defaults);
let spinning = false, rotation = 0, winner = null, context;
let theme = resolveTheme(read('lucky-theme', 'christmas'));
let colors = themes[theme].colors;
let celebrationFrame;
document.querySelector('#app').innerHTML = `
<header><a class="brand" href="${import.meta.env.BASE_URL}" aria-label="Lucky, trang chủ"><span class="brand-symbol" aria-hidden="true">✳</span><span>lucky<span class="brand-dot">.</span></span></a><span class="header-label">Vòng quay chọn tên</span><button id="sound" class="quiet" aria-pressed="true">♫ <span>Âm thanh bật</span></button></header>
<main id="main"><div class="intro"><div><div class="eyebrow">Chọn ngẫu nhiên. Chơi cùng nhau.</div><h1>Vòng quay <em>may mắn.</em></h1></div><p>Nhập danh sách, quay một vòng.<br>Lucky sẽ chọn một cái tên cho bạn.</p></div>
<div class="workspace"><section class="stage" aria-label="Vòng quay may mắn"><div class="stage-top"><span class="pill"><i></i> Sẵn sàng cho bất ngờ</span><span id="wheel-count"></span></div><div class="wheel-wrap"><div class="wheel-shadow"></div><button id="wheel" aria-label="Quay vòng quay may mắn"><canvas id="disc" width="1000" height="1000"></canvas><span class="hub">✳<small>QUAY</small></span></button><span class="pointer" aria-hidden="true"></span></div><div class="spin-caption"><span>↖</span> Chạm vào vòng quay để bắt đầu</div><p id="status" role="status">Mọi cái tên đều có cơ hội tỏa sáng.</p><div class="stage-bottom"><span>✧ Ngẫu nhiên & công bằng</span><span>Made for happy moments</span></div></section>
<aside class="panel"><div class="tabs"><button class="tab active" id="entries-tab">Danh sách <b id="entry-count">0</b></button><button class="tab" id="history-tab">Kết quả <b id="history-count">0</b></button></div><div id="entries-view"><div class="panel-heading"><div><h2>Những cái tên may mắn</h2><p>Mỗi dòng là một người tham gia.</p></div><span class="tiny-icon">☷</span></div><label for="names">DANH SÁCH THAM GIA</label><textarea id="names" spellcheck="false" placeholder="Nhập tên tại đây, mỗi dòng một tên…"></textarea><div class="editor-foot"><span>↵ Xuống dòng để thêm tên</span><span id="live-note">● Tự động lưu</span></div><div class="actions"><button id="shuffle">⇄ Trộn tên</button><button id="sort">↓ A–Z</button><button id="clear" class="clear">Xoá tất cả</button></div><div class="tip"><span>✦</span><p><strong>Một chút bất ngờ cho ngày hôm nay</strong><br>Chọn người nhận quà, chia nhóm hay đơn giản là quyết định ai mời trà sữa!</p></div></div><div id="history-view" hidden><div class="panel-heading"><div><h2>Khoảnh khắc may mắn</h2><p>Kết quả được lưu trên trình duyệt này.</p></div></div><ol id="history-list"></ol></div></aside></div>
<footer><span>Lucky <span aria-hidden="true">↗</span> Dành cho những cuộc vui.</span><span>Danh sách & kết quả được lưu trên trình duyệt này.</span></footer></main>
<dialog id="result"><div class="result-art">✦ 🏆 ✦</div><div class="eyebrow">KHOẢNH KHẮC CỦA BẠN!</div><h2>Xin chúc mừng</h2><p id="winner-name"></p><p class="result-sub">May mắn đã gọi tên bạn hôm nay.</p><div class="modal-actions"><button id="close-result">Đóng</button><button id="remove-winner">Xoá tên khỏi danh sách</button></div></dialog><canvas id="fireworks" aria-hidden="true"></canvas>`;
const $ = s => document.querySelector(s), names = $('#names'), disc = $('#disc'), ctx = disc.getContext('2d');
$('.stage-top .pill').innerHTML = '<i></i> Vòng quay của bạn';
$('.spin-caption').textContent = 'Bấm vòng quay hoặc nút bên dưới để bắt đầu.';
$('.stage-bottom').innerHTML = '<span>Chọn tên ngẫu nhiên</span><button id="pause-decorations" type="button" aria-pressed="false" hidden>Tạm dừng trang trí</button>';
$('.panel-heading h2').textContent = 'Người tham gia';
$('.tiny-icon').setAttribute('aria-hidden','true');
$('#entries-view label').textContent = 'Danh sách tham gia';
$('#status').textContent = 'Sẵn sàng chọn một người từ danh sách.';
$('#result .eyebrow').textContent = 'Kết quả vòng quay';
$('.tip').innerHTML = '<span aria-hidden="true">↗</span><p><strong>Mỗi tên là một lượt</strong><br>Tên trùng vẫn được giữ lại.</p>';
const spinButton = document.createElement('button');
spinButton.id = 'spin-button';
spinButton.type = 'button';
spinButton.innerHTML = '<span>Quay ngay</span><span aria-hidden="true">↗</span>';
$('.spin-caption').after(spinButton);
spinButton.onclick = () => $('#wheel').click();
$('#pause-decorations').onclick = () => {
  const paused = document.documentElement.dataset.idlePaused !== 'true';
  document.documentElement.dataset.idlePaused = String(paused);
  $('#pause-decorations').setAttribute('aria-pressed', String(paused));
  $('#pause-decorations').textContent = paused ? 'Tiếp tục trang trí' : 'Tạm dừng trang trí';
};
const themeControl = document.createElement('div');
themeControl.className = 'theme-control';
themeControl.innerHTML = '<label for="theme-select">Giao diện</label><select id="theme-select"><option value="default">✦ Mặc định</option><option value="christmas">🎄 Giáng sinh</option><option value="mid-autumn">🏮 Tết Trung Thu</option></select>';
$('#sound').before(themeControl);
$('#theme-select').value = theme;
names.value = typeof saved === 'string' ? saved : defaults;
const lanterns = document.createElement('div');
lanterns.id = 'lanterns';
lanterns.setAttribute('aria-hidden', 'true');
lanterns.innerHTML = Array.from({length:8}, (_,i) => `<span class="lantern" style="--lane:${8+i*12}%;--delay:${-i*2}s;--duration:${15+i%3*3}s"><i></i></span>`).join('');
$('.stage').prepend(lanterns);
const cakes = document.createElement('div');
cakes.id = 'tet-cakes';
cakes.setAttribute('aria-hidden', 'true');
cakes.innerHTML = Array.from({length:8}, (_,i) => `<span class="tet-cake ${i%2 ? 'banh-tet' : 'banh-chung'}" style="--lane:${7+i*12}%;--delay:${-i*2}s;--duration:${16+i%3*3}s"><i></i></span>`).join('');
$('.stage').prepend(cakes);
const tetOption = document.createElement('option');
tetOption.value = 'tet';
tetOption.textContent = '🧧 Tết Nguyên Đán';
$('#theme-select').append(tetOption);
$('#theme-select').value = theme;
function updateLanterns() {
  lanterns.hidden = theme !== 'mid-autumn' || spinning || $('#result').open;
  cakes.hidden = theme !== 'tet' || spinning || $('#result').open;
  $('#pause-decorations').hidden = !['tet','mid-autumn'].includes(theme);
}
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  colors = themes[theme].colors;
  $('.result-art').textContent = themes[theme].art;
  draw();
  updateLanterns();
}
$('#theme-select').onchange = () => {
  theme = resolveTheme($('#theme-select').value);
  persist('lucky-theme', theme);
  applyTheme();
};
function updatePointer(angle = rotation) {
  $('.pointer').style.borderRightColor = pointerColor(angle, parseNames(names.value).length, colors);
}
function persist(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { $('#live-note').textContent = 'Không thể lưu trên trình duyệt'; } }
function renderHistory() {
  $('#history-count').textContent = history.length;
  $('#history-list').replaceChildren();
  if (!history.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'Chưa có người trúng thưởng. Quay thử một vòng nhé!'; $('#history-list').append(p); }
  history.forEach((item, i) => { const li = document.createElement('li'), name = document.createElement('strong'), time = document.createElement('small'); name.textContent = item.name; time.textContent = new Date(item.time).toLocaleString('vi-VN'); li.append(document.createTextNode(String(history.length - i).padStart(2,'0') + '  '), name, time); $('#history-list').append(li); });
}
function draw() {
  const entries = parseNames(names.value), n = entries.length;
  $('#entry-count').textContent = n; $('#wheel-count').textContent = `${n} người tham gia`;
  ctx.clearRect(0,0,1000,1000);
  if (!n) { ctx.fillStyle='#e6e1f0'; ctx.beginPath(); ctx.arc(500,500,495,0,Math.PI*2); ctx.fill(); }
  entries.forEach((e,i) => { const a=i*2*Math.PI/n, b=(i+1)*2*Math.PI/n; ctx.beginPath(); ctx.moveTo(500,500); ctx.arc(500,500,495,a,b); ctx.closePath(); ctx.fillStyle=colors[i%colors.length]; ctx.fill(); ctx.strokeStyle='#ffffff25'; ctx.lineWidth=2; ctx.stroke(); ctx.save(); ctx.translate(500,500); ctx.rotate((a+b)/2); ctx.textAlign='right'; ctx.fillStyle='#fff'; ctx.font=`600 ${Math.max(10,Math.min(themes[theme].maxLabelSize ?? 35,550/n))}px ${themes[theme].font}`; const label=e.name.length>21?e.name.slice(0,20)+'…':e.name; ctx.fillText(label,448,10,300); ctx.restore(); });
  $('#wheel').disabled = !n || spinning;
  spinButton.disabled = !n || spinning;
  spinButton.querySelector('span').textContent = spinning ? 'Đang quay…' : 'Quay ngay';
  updatePointer();
}
function update() { persist('lucky-names',names.value); draw(); }
names.addEventListener('input',update);
$('#shuffle').onclick=()=> { const list=parseNames(names.value).map(x=>x.name); for(let i=list.length-1;i>0;i--) { const j=Math.floor(secureRandom()*(i+1)); [list[i],list[j]]=[list[j],list[i]]; } names.value=list.join('\n'); update(); };
$('#sort').onclick=()=> { names.value=parseNames(names.value).map(x=>x.name).sort((a,b)=>a.localeCompare(b,'vi')).join('\n'); update(); };
$('#clear').onclick=()=> { names.value=''; update(); };
function tab(results) { $('#entries-view').hidden=results; $('#history-view').hidden=!results; $('#entries-tab').classList.toggle('active',!results); $('#history-tab').classList.toggle('active',results); }
$('#entries-tab').onclick=()=>tab(false); $('#history-tab').onclick=()=>tab(true);
let sound=true;
$('#sound').onclick=()=> { sound=!sound; $('#sound').setAttribute('aria-pressed',sound); $('#sound').innerHTML=sound?'♫ <span>Âm thanh bật</span>':'♪ <span>Âm thanh tắt</span>'; };
function tada() {
  if (!sound || !context) return;
  [523.25,659.25,783.99,1046.5].forEach((frequency,i)=> { const oscillator=context.createOscillator(), gain=context.createGain(), start=context.currentTime+i*.13; oscillator.type='triangle'; oscillator.frequency.value=frequency; gain.gain.setValueAtTime(0,start); gain.gain.linearRampToValueAtTime(.16,start+.02); gain.gain.exponentialRampToValueAtTime(.001,start+.7); oscillator.connect(gain).connect(context.destination); oscillator.start(start); oscillator.stop(start+.75); });
}
$('#wheel').onclick=async()=> {
  if(spinning) return;
  const entries=parseNames(names.value); winner=chooseEntry(entries,secureRandom); if(!winner)return;
  spinning=true; names.disabled=true; document.querySelectorAll('.actions button').forEach(b=>b.disabled=true); draw(); $('#status').textContent='Vòng quay đang chọn một cái tên…';
  updateLanterns();
  $('#theme-select').disabled = true;
  if(sound) { try { context??=new (window.AudioContext||window.webkitAudioContext)(); await context.resume(); } catch {} }
  const index=entries.findIndex(e=>e.line===winner.line), angle=360/entries.length*(index+.5), target=(360-angle)%360;
  const startRotation = rotation;
  rotation += 360*6 + ((target-rotation%360+360)%360);
  const animation=disc.animate([{transform:disc.style.transform||'rotate(0deg)'},{transform:`rotate(${rotation}deg)`}],{duration:4800,easing:'cubic-bezier(.12,.72,.12,1)',fill:'forwards'});
  let pointerFrame;
  function trackPointer() {
    const progress = animation.effect.getComputedTiming().progress ?? 0;
    updatePointer(startRotation + (rotation - startRotation) * progress);
    pointerFrame = requestAnimationFrame(trackPointer);
  }
  trackPointer();
  await animation.finished; disc.style.transform=`rotate(${rotation}deg)`; animation.cancel();
  cancelAnimationFrame(pointerFrame);
  $('#theme-select').disabled = false;
  history.unshift({name:winner.name,time:new Date().toISOString()}); persist('lucky-history',history); renderHistory(); $('#winner-name').textContent=winner.name; $('#remove-winner').disabled=false; $('#result').showModal(); tada(); fireworks();
  spinning=false; names.disabled=false; document.querySelectorAll('.actions button').forEach(b=>b.disabled=false); draw(); $('#status').textContent=`${winner.name} đã trúng thưởng!`;
};
$('#result').addEventListener('close', () => {
  cancelAnimationFrame(celebrationFrame);
  const canvas = $('#fireworks');
  canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
  canvas.hidePopover?.();
  updateLanterns();
});
$('#close-result').onclick=()=>$('#result').close();
$('#remove-winner').onclick=()=> { names.value=removeEntry(names.value,winner); update(); $('#result').close(); };
function fireworks() {
  cancelAnimationFrame(celebrationFrame);
  const canvas=$('#fireworks'), c=canvas.getContext('2d'); canvas.width=innerWidth; canvas.height=innerHeight;
  // Đặt hiệu ứng trên lớp nền mờ của dialog để các hạt vẫn rõ và phát sáng.
  if (typeof canvas.showPopover === 'function') {
    canvas.setAttribute('popover', 'manual');
    canvas.showPopover();
  }
  canvas.dataset.effect = themes[theme].effect;
  if (themes[theme].effect === 'apricot') {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const blossoms = Array.from({length:reduced ? 22 : 75}, () => ({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height*.9-canvas.height*.2,
      size:7+Math.random()*7, speed:35+Math.random()*45, angle:Math.random()*Math.PI*2,
    }));
    let start;
    function apricot(time) {
      start ??= time;
      const elapsed = (time-start)/1000;
      c.clearRect(0,0,canvas.width,canvas.height);
      c.globalAlpha = Math.max(0,Math.min(1,(4.5-elapsed)/.8));
      c.shadowColor = '#f7c64b'; c.shadowBlur = 5;
      const popupBounds = $('#result').getBoundingClientRect();
      const canvasBounds = canvas.getBoundingClientRect();
      const scaleX = canvas.width/canvasBounds.width, scaleY = canvas.height/canvasBounds.height;
      const resultBounds = {
        left:(popupBounds.left-canvasBounds.left)*scaleX,
        right:(popupBounds.right-canvasBounds.left)*scaleX,
        top:(popupBounds.top-canvasBounds.top)*scaleY,
        bottom:(popupBounds.bottom-canvasBounds.top)*scaleY,
      };
      blossoms.forEach(flower => {
        const y = reduced ? flower.y : (flower.y + elapsed*flower.speed);
        const x = flower.x + (reduced ? 0 : Math.sin(elapsed+flower.angle)*25);
        const margin = flower.size*1.4 + 10;
        if (x > resultBounds.left-margin && x < resultBounds.right+margin &&
            y > resultBounds.top-margin && y < resultBounds.bottom+margin) return;
        c.save();
        c.translate(x,y);
        c.rotate(flower.angle + (reduced ? 0 : elapsed*.4));
        c.fillStyle = '#ffcf36';
        for (let petal=0;petal<5;petal++) {
          c.rotate(Math.PI*2/5); c.beginPath();
          c.ellipse(0,-flower.size*.65,flower.size*.45,flower.size*.65,0,0,Math.PI*2); c.fill();
        }
        c.shadowBlur=0; c.fillStyle='#b95b1d'; c.beginPath(); c.arc(0,0,flower.size*.22,0,Math.PI*2); c.fill();
        c.restore();
      });
      if (elapsed < 4.5) celebrationFrame = requestAnimationFrame(apricot);
      else { c.clearRect(0,0,canvas.width,canvas.height); canvas.hidePopover?.(); }
    }
    celebrationFrame = requestAnimationFrame(apricot);
    return;
  }
  if (themes[theme].effect === 'snow') {
    const flakes = Array.from({length:150}, () => ({x:Math.random()*canvas.width,y:Math.random()*canvas.height*1.2-canvas.height*.6,r:2+Math.random()*5,speed:1+Math.random()*3,drift:Math.random()*2-1}));
    let frame = 0;
    function snow() {
      c.clearRect(0,0,canvas.width,canvas.height);
      c.globalAlpha = Math.min(1,(240-frame)/40);
      c.shadowColor = '#fff5cf'; c.shadowBlur = 14;
      flakes.forEach((flake,i) => {
        flake.y += flake.speed; flake.x += flake.drift;
        c.fillStyle = i%5 === 0 ? '#f7d477' : '#ffffff';
        c.beginPath(); c.arc(flake.x,flake.y,flake.r,0,Math.PI*2); c.fill();
      });
      if (frame++ < 240) celebrationFrame = requestAnimationFrame(snow);
      else { c.clearRect(0,0,canvas.width,canvas.height); canvas.hidePopover?.(); }
    }
    snow(); return;
  }
  const celebrationColors = themes.default.colors;
  const particles=Array.from({length:180},()=> { const origin=Math.random()<.5?.22:.78, angle=Math.random()*Math.PI*2, speed=2+Math.random()*6; return {x:innerWidth*origin,y:innerHeight*.38,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-2,life:100+Math.random()*40,color:celebrationColors[Math.floor(Math.random()*celebrationColors.length)]}; });
  let frame=0; function tick(){c.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=> {p.x+=p.vx;p.y+=p.vy;p.vy+=.045;p.life--;c.globalAlpha=Math.max(0,p.life/140);c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=12;c.beginPath();c.arc(p.x,p.y,2.6,0,Math.PI*2);c.fill();}); if(frame++<160)celebrationFrame=requestAnimationFrame(tick);else {c.clearRect(0,0,canvas.width,canvas.height);canvas.hidePopover?.();} } tick();
}
document.fonts.addEventListener('loadingdone', () => {
  if (!spinning) draw();
});
renderHistory(); applyTheme();
