'use strict';

const COLS = 10, ROWS = 20, CELL = 30;

const COLORS = {
  I:'#22d3ee', O:'#facc15', T:'#c084fc',
  S:'#4ade80', Z:'#f87171', J:'#60a5fa', L:'#fb923c'
};

const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]]
};

const WK = {
  JLSTZ: {
    '0>1':[[-1,0],[-1,1],[0,-2],[-1,-2]],
    '1>0':[[1,0],[1,-1],[0,2],[1,2]],
    '1>2':[[1,0],[1,-1],[0,2],[1,2]],
    '2>1':[[-1,0],[-1,1],[0,-2],[-1,-2]],
    '2>3':[[1,0],[1,1],[0,-2],[1,-2]],
    '3>2':[[-1,0],[-1,-1],[0,2],[-1,2]],
    '3>0':[[-1,0],[-1,-1],[0,2],[-1,2]],
    '0>3':[[1,0],[1,1],[0,-2],[1,-2]]
  },
  I: {
    '0>1':[[-2,0],[1,0],[-2,-1],[1,2]],
    '1>0':[[2,0],[-1,0],[2,1],[-1,-2]],
    '1>2':[[-1,0],[2,0],[-1,2],[2,-1]],
    '2>1':[[1,0],[-2,0],[1,-2],[-2,1]],
    '2>3':[[2,0],[-1,0],[2,1],[-1,-2]],
    '3>2':[[-2,0],[1,0],[-2,-1],[1,2]],
    '3>0':[[1,0],[-2,0],[1,-2],[-2,1]],
    '0>3':[[-1,0],[2,0],[-1,2],[2,-1]]
  }
};

const SCORE_TABLE = [0,100,300,500,800];
const NOTIF_TEXT  = ['','SINGLE','DOUBLE','TRIPLE','TETRIS!'];
const NOTIF_COLOR = ['','#e3e3f0','#4ade80','#22d3ee','#facc15'];
const LOCK_MS = 500, DAS_MS = 155, ARR_MS = 45;

function dropMs(lvl){ return Math.max(55, 900-(lvl-1)*72); }

const cv      = document.getElementById('cv');
const ctx     = cv.getContext('2d');
const holdCv  = document.getElementById('hold-cv');
const holdCtx = holdCv.getContext('2d');
const nextCv  = document.getElementById('next-cv');
const nextCtx = nextCv.getContext('2d');

cv.width  = COLS * CELL;
cv.height = ROWS * CELL;

const elScore  = document.getElementById('score-val');
const elLevel  = document.getElementById('level-val');
const elLines  = document.getElementById('lines-val');
const elHi     = document.getElementById('hi-val');
const elProg   = document.getElementById('prog');
const elFinal  = document.getElementById('final-score');
const elNotif  = document.getElementById('notif');
const elBadge  = document.getElementById('badge-best');
const ovStart  = document.getElementById('ov-start');
const ovPause  = document.getElementById('ov-pause');
const ovOver   = document.getElementById('ov-over');

let board, score, dispScore, level, lines, hiScore;
let cur, nextType, holdType, canHold;
let running, paused;
let raf, lastTs, dropAcc, lockAcc, locking;
let bag, particles;

const TYPES = ['I','O','T','S','Z','J','L'];

function fillBag(){
  bag = [...TYPES];
  for(let i=bag.length-1;i>0;i--){
    const j=(Math.random()*(i+1))|0;
    [bag[i],bag[j]]=[bag[j],bag[i]];
  }
}

function fromBag(){
  if(!bag.length) fillBag();
  return bag.pop();
}

function mkPiece(type){
  return {
    type,
    mat: SHAPES[type].map(r=>[...r]),
    color: COLORS[type],
    x: type==='O' ? 4 : 3,
    y: type==='I' ? -1 : 0,
    rot: 0
  };
}

function mkBoard(){
  return Array.from({length:ROWS}, ()=>new Array(COLS).fill(null));
}

function valid(piece, dx=0, dy=0, mat=null){
  const m = mat||piece.mat;
  for(let r=0;r<m.length;r++)
    for(let c=0;c<m[r].length;c++){
      if(!m[r][c]) continue;
      const nx=piece.x+c+dx, ny=piece.y+r+dy;
      if(nx<0||nx>=COLS||ny>=ROWS) return false;
      if(ny>=0 && board[ny][nx]) return false;
    }
  return true;
}

function rotateMat(m, dir){
  const R=m.length, C=m[0].length;
  const out=Array.from({length:C},()=>new Array(R).fill(0));
  if(dir===1)
    for(let r=0;r<R;r++) for(let c=0;c<C;c++) out[c][R-1-r]=m[r][c];
  else
    for(let r=0;r<R;r++) for(let c=0;c<C;c++) out[C-1-c][r]=m[r][c];
  return out;
}

function tryRotate(dir){
  if(!cur) return;
  const newMat = rotateMat(cur.mat, dir);
  const newRot = ((cur.rot+dir)+4)%4;
  const table  = cur.type==='I' ? WK.I : WK.JLSTZ;
  const kicks  = table[`${cur.rot}>${newRot}`]||[];
  if(valid(cur,0,0,newMat)){
    cur.mat=newMat; cur.rot=newRot;
    resetLock(); return;
  }
  for(const [kx,ky] of kicks){
    if(valid(cur,kx,-ky,newMat)){
      cur.mat=newMat; cur.x+=kx; cur.y-=ky; cur.rot=newRot;
      resetLock(); return;
    }
  }
}

function moveH(dx){
  if(cur && valid(cur,dx)){ cur.x+=dx; resetLock(); }
}

function softDrop(){
  if(!cur) return;
  if(valid(cur,0,1)){ cur.y++; score++; dropAcc=0; resetLock(); }
}

function hardDrop(){
  if(!cur) return;
  let d=0;
  while(valid(cur,0,d+1)) d++;
  score += d*2;
  cur.y += d;
  lockPiece();
}

function ghostRow(){
  let g=0;
  while(valid(cur,0,g+1)) g++;
  return cur.y+g;
}

function resetLock(){ lockAcc=0; locking=false; }

function lockPiece(){
  if(!cur) return;
  cur.mat.forEach((row,r)=>row.forEach((v,c)=>{
    if(!v) return;
    const ny=cur.y+r, nx=cur.x+c;
    if(ny>=0 && ny<ROWS) board[ny][nx]=cur.color;
  }));

  const full=[];
  for(let r=0;r<ROWS;r++)
    if(board[r].every(c=>c!==null)) full.push(r);

  if(full.length){
    full.forEach(row=>{
      for(let col=0;col<COLS;col++)
        spawnParticles(col*CELL+CELL*.5, row*CELL+CELL*.5, board[row][col]);
    });
    full.sort((a,b)=>b-a).forEach(r=>{
      board.splice(r,1);
      board.unshift(new Array(COLS).fill(null));
    });
    const n   = full.length;
    const pts = SCORE_TABLE[n]*level;
    score    += pts;
    lines    += n;
    const newLvl = Math.floor(lines/10)+1;
    if(newLvl>level){
      level=newLvl;
      showNotif('LEVEL  UP!','#c084fc');
    } else {
      showNotif(NOTIF_TEXT[n], NOTIF_COLOR[n]);
    }
    animPop(elScore);
    animPop(elLines);
  }

  hiScore = Math.max(hiScore, score);
  elHi.textContent = hiScore.toLocaleString();
  localStorage.setItem('tet_hi', hiScore);
  elLevel.textContent = level;
  elLines.textContent = lines;
  elProg.style.width  = ((lines%10)*10)+'%';

  cur      = mkPiece(nextType);
  nextType = fromBag();
  canHold  = true;
  locking  = false;
  lockAcc  = 0;

  if(!valid(cur)) endGame();
}

function doHold(){
  if(!canHold||!cur) return;
  canHold=false;
  if(holdType){
    const tmp=holdType;
    holdType=cur.type;
    cur=mkPiece(tmp);
  } else {
    holdType=cur.type;
    cur=mkPiece(nextType);
    nextType=fromBag();
  }
  locking=false; lockAcc=0;
  if(!valid(cur)) endGame();
}

function spawnParticles(cx,cy,color){
  for(let i=0;i<12;i++){
    const a=Math.random()*Math.PI*2;
    const s=.6+Math.random()*4.2;
    particles.push({
      x:cx, y:cy,
      vx:Math.cos(a)*s, vy:Math.sin(a)*s,
      alpha:1,
      size:1.4+Math.random()*2.8,
      decay:.016+Math.random()*.018,
      color
    });
  }
}

let notifT=null;
function showNotif(msg,color){
  if(!msg) return;
  elNotif.textContent=msg;
  elNotif.style.color=color;
  elNotif.classList.add('show');
  clearTimeout(notifT);
  notifT=setTimeout(()=>elNotif.classList.remove('show'),850);
}

function animPop(el){
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

function drawBlock(ctx2d, col, row, color, alpha, cs){
  if(alpha===undefined) alpha=1;
  if(cs===undefined) cs=CELL;
  const x=col*cs+1, y=row*cs+1, s=cs-2;
  ctx2d.save();
  ctx2d.globalAlpha=alpha;
  ctx2d.fillStyle=color;
  ctx2d.beginPath();
  ctx2d.roundRect(x,y,s,s,3);
  ctx2d.fill();
  const g=ctx2d.createLinearGradient(x,y,x,y+s);
  g.addColorStop(0,   'rgba(255,255,255,.30)');
  g.addColorStop(.4,  'rgba(255,255,255,.05)');
  g.addColorStop(1,   'rgba(0,0,0,.25)');
  ctx2d.fillStyle=g;
  ctx2d.beginPath();
  ctx2d.roundRect(x,y,s,s,3);
  ctx2d.fill();
  ctx2d.fillStyle='rgba(255,255,255,.18)';
  ctx2d.beginPath();
  ctx2d.roundRect(x+2,y+2,s-4,3,1);
  ctx2d.fill();
  ctx2d.restore();
}

function drawMini(ctx2d, type, cw, ch){
  ctx2d.clearRect(0,0,cw,ch);
  if(!type) return;
  const mat=SHAPES[type], color=COLORS[type];
  const R=mat.length, C=mat[0].length;
  const cs=Math.min(Math.floor(cw/(C+.6)), Math.floor(ch/(R+.6)), 22);
  const ox=Math.floor((cw-C*cs)*.5);
  const oy=Math.floor((ch-R*cs)*.5);
  mat.forEach((row,r)=>row.forEach((v,c)=>{
    if(!v) return;
    const x=ox+c*cs+1, y=oy+r*cs+1, s=cs-2;
    ctx2d.fillStyle=color;
    ctx2d.beginPath(); ctx2d.roundRect(x,y,s,s,2); ctx2d.fill();
    const g=ctx2d.createLinearGradient(x,y,x,y+s);
    g.addColorStop(0,  'rgba(255,255,255,.28)');
    g.addColorStop(.4, 'rgba(255,255,255,.04)');
    g.addColorStop(1,  'rgba(0,0,0,.22)');
    ctx2d.fillStyle=g;
    ctx2d.beginPath(); ctx2d.roundRect(x,y,s,s,2); ctx2d.fill();
  }));
}

function render(){
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.fillStyle='rgba(255,255,255,.02)';
  for(let r=0;r<ROWS;r++)
    for(let c=0;c<COLS;c++){
      ctx.beginPath();
      ctx.roundRect(c*CELL+1,r*CELL+1,CELL-2,CELL-2,2);
      ctx.fill();
    }
  for(let r=0;r<ROWS;r++)
    for(let c=0;c<COLS;c++)
      if(board[r][c]) drawBlock(ctx,c,r,board[r][c]);
  if(cur && running && !paused){
    const gy=ghostRow();
    cur.mat.forEach((row,r)=>row.forEach((v,c)=>{
      if(!v) return;
      const gc=cur.x+c, gr=gy+r;
      if(gr<0||gr>=ROWS) return;
      ctx.save();
      ctx.globalAlpha=.17;
      ctx.strokeStyle=cur.color;
      ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.roundRect(gc*CELL+2,gr*CELL+2,CELL-4,CELL-4,3);
      ctx.stroke();
      ctx.restore();
    }));
  }
  if(cur){
    cur.mat.forEach((row,r)=>row.forEach((v,c)=>{
      if(!v) return;
      const dc=cur.x+c, dr=cur.y+r;
      if(dr>=0) drawBlock(ctx,dc,dr,cur.color);
    }));
  }
  particles.forEach(p=>{
    ctx.save();
    ctx.globalAlpha=p.alpha;
    ctx.fillStyle=p.color;
    ctx.shadowColor=p.color;
    ctx.shadowBlur=7;
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  });
  drawMini(holdCtx, holdType, holdCv.width, holdCv.height);
  drawMini(nextCtx, nextType, nextCv.width, nextCv.height);
}

function tickScore(){
  if(dispScore===score) return;
  const step=Math.max(1,Math.ceil(Math.abs(score-dispScore)/10));
  dispScore=dispScore<score ? Math.min(dispScore+step,score) : score;
  elScore.textContent=dispScore.toLocaleString();
}

function loop(ts){
  raf=requestAnimationFrame(loop);
  const dt=Math.min(ts-(lastTs||ts),50);
  lastTs=ts;
  if(running && !paused){
    dropAcc+=dt;
    if(dropAcc>=dropMs(level)){
      dropAcc=0;
      if(cur && valid(cur,0,1)) cur.y++;
    }
    if(cur && !valid(cur,0,1)){
      locking=true;
      lockAcc+=dt;
      if(lockAcc>=LOCK_MS) lockPiece();
    } else {
      if(locking) resetLock();
    }
    particles=particles.filter(p=>p.alpha>0);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      p.vy+=.1; p.vx*=.985;
      p.alpha-=p.decay;
    });
    tickScore();
  }
  render();
}

function initGame(){
  board     = mkBoard();
  score     = 0;
  dispScore = 0;
  level     = 1;
  lines     = 0;
  canHold   = true;
  holdType  = null;
  particles = [];
  dropAcc   = 0;
  lockAcc   = 0;
  locking   = false;
  lastTs    = null;
  bag=[]; fillBag();
  nextType = fromBag();
  cur      = mkPiece(nextType);
  nextType = fromBag();
  hiScore  = parseInt(localStorage.getItem('tet_hi')||'0',10);
  elScore.textContent = '0';
  elLevel.textContent = '1';
  elLines.textContent = '0';
  elProg.style.width  = '0%';
  elHi.textContent    = hiScore.toLocaleString();
}

function startGame(){
  initGame();
  running=true; paused=false;
  ovStart.classList.add('hide');
  if(!raf) raf=requestAnimationFrame(loop);
}

function endGame(){
  running=false;
  elFinal.textContent=score.toLocaleString();
  const prev=parseInt(localStorage.getItem('tet_hi')||'0',10);
  if(score>prev){
    localStorage.setItem('tet_hi',score);
    elHi.textContent=score.toLocaleString();
    elBadge.style.display='inline-flex';
  } else {
    elBadge.style.display='none';
  }
  setTimeout(()=>ovOver.classList.remove('hide'),300);
}

function togglePause(){
  if(!running) return;
  paused=!paused;
  if(paused){ ovPause.classList.remove('hide'); lastTs=null; }
  else       { ovPause.classList.add('hide');    lastTs=null; }
}

function restart(){
  ovOver.classList.add('hide');
  setTimeout(startGame,320);
}

const dasH={};
function dasOn(key,fn){ fn(); dasOff(key); dasH[key]=setTimeout(()=>{ dasH[key]=setInterval(fn,ARR_MS); },DAS_MS); }
function dasOff(key){ clearTimeout(dasH[key]); clearInterval(dasH[key]); delete dasH[key]; }

document.addEventListener('keydown',e=>{
  if(!running){
    if(e.code==='Enter'||e.code==='Space'){
      e.preventDefault();
      if(!ovStart.classList.contains('hide'))  startGame();
      if(!ovOver.classList.contains('hide'))   restart();
    }
    return;
  }
  if(e.code==='KeyP'||e.code==='Escape'){ togglePause(); return; }
  if(paused) return;
  switch(e.code){
    case 'ArrowLeft':  case 'KeyA': e.preventDefault(); dasOn('l',()=>moveH(-1)); break;
    case 'ArrowRight': case 'KeyD': e.preventDefault(); dasOn('r',()=>moveH(1));  break;
    case 'ArrowDown':  case 'KeyS': e.preventDefault(); dasOn('d',softDrop);      break;
    case 'ArrowUp':    case 'KeyW': e.preventDefault(); tryRotate(1);             break;
    case 'KeyZ':                    e.preventDefault(); tryRotate(-1);            break;
    case 'Space':                   e.preventDefault(); hardDrop();               break;
    case 'KeyC':                    e.preventDefault(); doHold();                 break;
  }
});

document.addEventListener('keyup',e=>{
  switch(e.code){
    case 'ArrowLeft':  case 'KeyA': dasOff('l'); break;
    case 'ArrowRight': case 'KeyD': dasOff('r'); break;
    case 'ArrowDown':  case 'KeyS': dasOff('d'); break;
  }
});

document.getElementById('btn-start').addEventListener('click',   startGame);
document.getElementById('btn-resume').addEventListener('click',  togglePause);
document.getElementById('btn-restart').addEventListener('click', restart);

hiScore   = parseInt(localStorage.getItem('tet_hi')||'0',10);
elHi.textContent = hiScore.toLocaleString();
board     = mkBoard();
particles = [];
ctx.fillStyle='rgba(255,255,255,.02)';
for(let r=0;r<ROWS;r++)
  for(let c=0;c<COLS;c++){
    ctx.beginPath();
    ctx.roundRect(c*CELL+1,r*CELL+1,CELL-2,CELL-2,2);
    ctx.fill();
  }
raf=requestAnimationFrame(loop);