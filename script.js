const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const overlay=$("#overlay"),startBtn=$("#startBtn"),music=$("#music"),muteBtn=$("#muteBtn"),musicButton=$("#musicButton"),musicLabel=$("#musicLabel");
const videos=[...$$(".bg-video")];let current=0,started=false;

function syncMusicUI(){
 const playing=!music.paused;
 muteBtn.innerHTML=`<i class="fa-solid ${playing?"fa-volume-high":"fa-volume-xmark"}"></i>`;
 musicButton.classList.toggle("playing",playing);
 musicLabel.textContent=playing?"Music playing":"Play music";
}
async function startExperience(){
 if(started)return; started=true; overlay.classList.add("hidden");
 playVideo(0);
 try{await music.play()}catch(e){};
 syncMusicUI();
}
startBtn.addEventListener("click",startExperience);
function playVideo(i){
 videos.forEach((v,n)=>{v.classList.toggle("active",n===i);if(n!==i){v.pause();try{v.currentTime=0}catch(e){}}});
 current=i; const p=videos[i].play(); if(p)p.catch(()=>{});
}
videos.forEach((v,i)=>v.addEventListener("ended",()=>playVideo((i+1)%videos.length)));

async function toggleMusic(){
 try{if(music.paused)await music.play();else music.pause()}catch(e){}
 syncMusicUI();
}
muteBtn.addEventListener("click",toggleMusic);musicButton.addEventListener("click",toggleMusic);music.addEventListener("play",syncMusicUI);music.addEventListener("pause",syncMusicUI);

$$("[data-link]").forEach(el=>el.addEventListener("click",()=>{const url=el.dataset.link;if(url)window.open(url,"_blank","noopener,noreferrer")}));

const clock=$("#clock"),date=$("#date");
function updateClock(){
 const now=new Date(),tz="Africa/Algiers";
 clock.textContent=new Intl.DateTimeFormat("en-DZ",{timeZone:tz,hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false}).format(now);
 date.textContent=new Intl.DateTimeFormat("en-DZ",{timeZone:tz,weekday:"short",day:"2-digit",month:"short"}).format(now);
}
updateClock();setInterval(updateClock,1000);$("#year").textContent=new Date().getFullYear();

const cursor=$("#cursor");let mx=-100,my=-100,cx=-100,cy=-100;
if(matchMedia("(pointer:fine)").matches){
 addEventListener("pointermove",e=>{mx=e.clientX;my=e.clientY});
 function tick(){cx+=(mx-cx)*.18;cy+=(my-cy)*.18;cursor.style.left=cx+"px";cursor.style.top=cy+"px";requestAnimationFrame(tick)}tick();
 $$("button").forEach(b=>{b.addEventListener("mouseenter",()=>{cursor.style.width="36px";cursor.style.height="36px";cursor.style.background="rgba(110,168,255,.12)"});b.addEventListener("mouseleave",()=>{cursor.style.width="21px";cursor.style.height="21px";cursor.style.background="transparent"})});
}
addEventListener("keydown",e=>{if(e.key.toLowerCase()==="m")toggleMusic();if(e.key==="Escape"&&!overlay.classList.contains("hidden"))startExperience()});
