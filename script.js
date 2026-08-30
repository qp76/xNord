(() => {
  "use strict";

  const cfg = window.SITE_CONFIG;
  if (!cfg) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const welcome = $("#welcome");
  const enterBtn = $("#enterBtn");
  const videoTrack = $("#videoTrack");
  const videoSoundBtn = $("#videoSoundBtn");
  const musicBtn = $("#musicBtn");
  const music = $("#music");
  const equalizer = $("#equalizer");
  const toast = $("#toast");

  // ---------- Config-driven content ----------
  $("#welcomeTitle").innerHTML = `Welcome to <strong>${escapeHTML(cfg.profile.name)}</strong>`;
  $("#welcomeLocation").textContent = cfg.profile.location.toUpperCase();
  $("#locationText").textContent = cfg.profile.location;
  $("#timezoneText").textContent = cfg.profile.timezoneLabel;
  $("#eyebrowText").textContent = cfg.profile.eyebrow;
  $("#profileName").innerHTML = `${escapeHTML(cfg.profile.namePrefix)}<span>${escapeHTML(cfg.profile.accentName)}</span>`;
  $("#bioLine1").textContent = cfg.profile.bio;
  $("#bioLine2").textContent = cfg.profile.bioLine2;
  $("#clockZone").textContent = cfg.profile.location.toUpperCase();
  $("#footerName").textContent = cfg.profile.name;
  $("#footerText").textContent = cfg.profile.footer;
  $("#year").textContent = new Date().getFullYear();

  const links = $("#links");
  cfg.links.filter(item => item.enabled !== false).forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `link-card link-${item.id}`;
    button.dataset.link = item.url;
    button.innerHTML = `
      <span class="brand"><i class="${item.icon}" aria-hidden="true"></i></span>
      <span class="link-copy"><b>${escapeHTML(item.title)}</b><small>${escapeHTML(item.subtitle)}</small></span>
      <i class="fa-solid fa-arrow-up-right-from-square link-arrow" aria-hidden="true"></i>`;
    button.addEventListener("click", () => openExternal(item.url));
    links.appendChild(button);
  });

  if (cfg.feedback.enabled === false) $("#feedbackBtn").remove();
  else {
    $("#feedbackText").textContent = cfg.feedback.label;
    $("#feedbackBtn").addEventListener("click", () => openExternal(cfg.feedback.url));
  }

  music.src = cfg.music.src || "";
  if (!cfg.music.enabled || !cfg.music.src) musicBtn.hidden = true;
  $("#musicLabel").textContent = "Play music";

  // ---------- Background video engine ----------
  const videos = cfg.videos.map((src, index) => {
    const video = document.createElement("video");
    video.className = "bg-video";
    video.dataset.index = index;
    video.src = src;
    video.preload = index === 0 ? "auto" : "metadata";
    video.playsInline = true;
    video.loop = false;
    video.muted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    videoTrack.appendChild(video);
    return video;
  });

  let currentVideo = 0;
  let videoSoundOn = false;
  let musicOn = false;
  let started = false;
  let switchTimer = null;

  function setActiveVideo(index, immediate = false) {
    if (!videos.length) return;
    currentVideo = (index + videos.length) % videos.length;
    videos.forEach((video, i) => {
      video.classList.toggle("active", i === currentVideo);
      video.muted = !(videoSoundOn && i === currentVideo);
      if (i !== currentVideo) video.pause();
    });

    const active = videos[currentVideo];
    active.currentTime = 0;
    const playPromise = active.play();
    if (playPromise) playPromise.catch(() => {});
    if (immediate) active.style.transition = "none";
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => active.style.removeProperty("transition"), 80);
  }

  function nextVideo() {
    setActiveVideo(currentVideo + 1);
  }

  videos.forEach((video) => {
    video.addEventListener("ended", () => {
      if (video === videos[currentVideo]) nextVideo();
    });
    video.addEventListener("error", () => {
      if (video === videos[currentVideo]) {
        showToast("Background video could not be loaded.");
        setTimeout(nextVideo, 800);
      }
    });
  });

  // ---------- Video sound ----------
  function renderVideoSound() {
    videoSoundBtn.setAttribute("aria-pressed", String(videoSoundOn));
    videoSoundBtn.innerHTML = `<i class="fa-solid ${videoSoundOn ? "fa-volume-high" : "fa-volume-xmark"}"></i>`;
    videoSoundBtn.title = videoSoundOn ? "Mute video sound" : "Unmute video sound";
    videos.forEach((video, i) => video.muted = !(videoSoundOn && i === currentVideo));
  }

  videoSoundBtn.addEventListener("click", () => {
    videoSoundOn = !videoSoundOn;
    renderVideoSound();
    if (videoSoundOn && musicOn) {
      music.pause();
      musicOn = false;
      renderMusic();
      showToast("Video sound enabled · music paused");
    }
  });

  // ---------- Music ----------
  function renderMusic() {
    const label = $("#musicLabel");
    const state = $("#musicState");
    musicBtn.setAttribute("aria-pressed", String(musicOn));
    musicBtn.classList.toggle("playing", musicOn);
    equalizer.classList.toggle("playing", musicOn);
    label.textContent = musicOn ? "Pause music" : "Play music";
    state.textContent = musicOn ? "ON" : "OFF";
  }

  async function toggleMusic() {
    if (!music.src) return;
    if (music.paused) {
      if (videoSoundOn) {
        videoSoundOn = false;
        renderVideoSound();
      }
      try {
        await music.play();
        musicOn = true;
      } catch {
        musicOn = false;
        showToast("Music could not be played. Check the music URL in config.js.");
      }
    } else {
      music.pause();
      musicOn = false;
    }
    renderMusic();
  }
  musicBtn.addEventListener("click", toggleMusic);
  music.addEventListener("play", () => { musicOn = true; renderMusic(); });
  music.addEventListener("pause", () => { musicOn = false; renderMusic(); });
  music.addEventListener("error", () => showToast("Music source unavailable. Replace music.src in config.js."));

  // ---------- Welcome / autoplay policy ----------
  async function startExperience() {
    if (started) return;
    started = true;
    welcome.classList.add("hidden");
    document.body.classList.add("started");
    setActiveVideo(0, true);
    renderVideoSound();
    renderMusic();
    try { await music.play(); musicOn = true; renderMusic(); } catch { /* Browser may block external audio; button remains available. */ }
  }
  enterBtn.addEventListener("click", startExperience);
  welcome.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); startExperience(); }
  });

  // ---------- Algeria clock ----------
  const clock = $("#clock");
  const date = $("#date");
  function updateClock() {
    const now = new Date();
    clock.textContent = new Intl.DateTimeFormat("en-DZ", {
      timeZone: cfg.profile.timezone,
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(now);
    date.textContent = new Intl.DateTimeFormat("en-DZ", {
      timeZone: cfg.profile.timezone,
      weekday: "short", day: "2-digit", month: "short"
    }).format(now);
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ---------- Cursor ----------
  const cursor = $("#cursor");
  const finePointer = window.matchMedia("(pointer:fine)");
  if (finePointer.matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; }, { passive: true });
    const tick = () => {
      cx += (x - cx) * .16; cy += (y - cy) * .16;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      requestAnimationFrame(tick);
    };
    tick();
    const bindCursor = () => $$("button").forEach(el => {
      el.addEventListener("pointerenter", () => cursor.classList.add("hover"));
      el.addEventListener("pointerleave", () => cursor.classList.remove("hover"));
    });
    bindCursor();
  }

  document.addEventListener("keydown", event => {
    if (event.key.toLowerCase() === "m") toggleMusic();
    if (event.key.toLowerCase() === "v") videoSoundBtn.click();
    if (event.key === "Escape" && !started) startExperience();
  });

  function openExternal(url) {
    if (!url || url === "#") return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
  }

  renderVideoSound();
  renderMusic();
})();
