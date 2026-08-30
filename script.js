(() => {
  "use strict";
  const cfg = window.SITE_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const welcome = $("#welcome");
  const enterBtn = $("#enterBtn");
  const videoTrack = $("#videoTrack");
  const videoSoundBtn = $("#videoSoundBtn");
  const toast = $("#toast");

  const profile = cfg.profile || {};
  const videoConfig = cfg.video || {};
  const videoSources = Array.isArray(cfg.videos) ? cfg.videos.filter(Boolean) : [];
  const videos = [];
  let currentVideo = 0;
  let soundOn = false;
  let started = false;
  let toastTimer;

  // ---------- Personalisation ----------
  document.documentElement.style.setProperty("--accent", profile.accent || "#6fa5ff");
  $("#locationText").textContent = profile.location || "Algeria";
  $("#timezoneText").textContent = profile.timezoneLabel || "UTC+1";
  $("#clockZone").textContent = String(profile.location || "Algeria").toUpperCase();
  $("#welcomeLocation").textContent = String(profile.location || "Algeria").toUpperCase();
  $("#eyebrowText").textContent = profile.eyebrow || "DIGITAL PROFILE";
  $("#welcomeDescription").textContent = profile.welcomeText || "Click enter to visit my profile.";
  $("#footerName").textContent = profile.name || "Nord87q";
  $("#footerText").textContent = profile.footer || "Made in Algeria";
  $("#year").textContent = new Date().getFullYear();

  const prefix = profile.namePrefix ?? profile.name ?? "Nord";
  const accentName = profile.accentName ?? "87q";
  $("#profileName").innerHTML = `${escapeHTML(prefix)}<span>${escapeHTML(accentName)}</span>`;
  $("#welcomeTitle").innerHTML = `Welcome to <strong>${escapeHTML(profile.name || "Nord87q")}</strong>`;

  const bioLines = String(profile.bio || "").split(/\r?\n/).filter(Boolean);
  $("#bio").innerHTML = bioLines.map(escapeHTML).join("<br>");

  setupAvatar("#avatarImage", "#avatarInitial", profile.avatar, profile.name);
  setupAvatar("#welcomeAvatar", "#welcomeInitial", profile.avatar, profile.name);

  const badges = $("#badges");
  (cfg.badges || []).forEach(badge => {
    if (!badge || !badge.title) return;
    const el = document.createElement("span");
    el.className = "badge";
    el.title = badge.title;
    el.innerHTML = `<i class="${escapeAttr(badge.icon || "fa-solid fa-star")}"></i><span>${escapeHTML(badge.title)}</span>`;
    badges.appendChild(el);
  });

  const links = $("#links");
  (cfg.links || []).filter(item => item && item.enabled !== false && item.url).forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `link-card link-${escapeClass(item.id || "custom")}`;
    button.innerHTML = `
      <span class="brand"><i class="${escapeAttr(item.icon || "fa-solid fa-link")}" aria-hidden="true"></i></span>
      <span class="link-copy"><b>${escapeHTML(item.title || "Link")}</b><small>${escapeHTML(item.subtitle || "Open link")}</small></span>
      <i class="fa-solid fa-arrow-up-right-from-square link-arrow" aria-hidden="true"></i>`;
    button.addEventListener("click", () => openExternal(item.url));
    links.appendChild(button);
  });

  // ---------- Background video engine ----------
  function buildVideos() {
    if (!videoSources.length) {
      videoTrack.innerHTML = "";
      return;
    }

    videoSources.forEach((src, index) => {
      const video = document.createElement("video");
      video.className = "bg-video";
      video.src = src;
      video.poster = `./posters/poster-${index + 1}.jpg`;
      video.preload = index === 0 ? "auto" : "metadata";
      video.playsInline = true;
      video.muted = true;
      video.loop = false;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("disablepictureinpicture", "");
      videoTrack.appendChild(video);
      videos.push(video);

      video.addEventListener("ended", () => {
        if (video === videos[currentVideo]) nextVideo();
      });
      video.addEventListener("error", () => {
        if (video === videos[currentVideo]) {
          showToast("A background video failed to load — skipping it.");
          window.setTimeout(nextVideo, 500);
        }
      });
      video.addEventListener("stalled", () => {
        // Browser can recover by itself; no aggressive restart here.
      });
    });
  }

  function setVideoState(index, restart = true) {
    if (!videos.length) return;
    currentVideo = ((index % videos.length) + videos.length) % videos.length;

    videos.forEach((video, i) => {
      const active = i === currentVideo;
      video.classList.toggle("active", active);
      video.muted = !(soundOn && active);
      if (!active) {
        video.pause();
        video.removeAttribute("controls");
      }
    });

    const active = videos[currentVideo];
    if (restart) {
      try { active.currentTime = 0; } catch {}
    }
    const playPromise = active.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        if (started) showToast("Tap Enter again if your browser blocked video playback.");
      });
    }
  }

  function nextVideo() {
    if (!videos.length) return;
    if (currentVideo >= videos.length - 1 && videoConfig.loopPlaylist === false) return;
    setVideoState(currentVideo + 1, true);
  }

  buildVideos();

  // ---------- Video sound ----------
  function renderSound() {
    videoSoundBtn.setAttribute("aria-pressed", String(soundOn));
    videoSoundBtn.setAttribute("aria-label", soundOn ? "Mute video sound" : "Unmute video sound");
    videoSoundBtn.title = soundOn ? "Mute video sound" : "Unmute video sound";
    videoSoundBtn.innerHTML = `<i class="fa-solid ${soundOn ? "fa-volume-high" : "fa-volume-xmark"}"></i>`;
    videos.forEach((video, i) => video.muted = !(soundOn && i === currentVideo));
  }

  videoSoundBtn.addEventListener("click", () => {
    if (!started) {
      startExperience(true);
      return;
    }
    soundOn = !soundOn;
    renderSound();
    const active = videos[currentVideo];
    if (active) {
      active.muted = !soundOn;
      if (soundOn) {
        const p = active.play();
        if (p) p.catch(() => showToast("Your browser blocked video audio. Tap the button again."));
      }
    }
  });

  // ---------- Entry ----------
  async function startExperience(fromSoundButton = false) {
    if (started) return;
    started = true;
    document.body.classList.add("started");
    welcome.classList.add("hidden");

    // The click/tap is a user gesture, so this is the correct point to start video.
    soundOn = fromSoundButton ? true : Boolean(videoConfig.startMuted === false);
    renderSound();
    setVideoState(0, true);

    // Give the browser a frame to apply the active video before removing the welcome layer.
    requestAnimationFrame(() => document.body.classList.add("video-ready"));
  }

  enterBtn.addEventListener("click", () => startExperience(false));
  welcome.addEventListener("click", event => {
    if (event.target === welcome) startExperience(false);
  });
  document.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") && !started) {
      event.preventDefault();
      startExperience(false);
    }
    if (event.key === "Escape" && !started) startExperience(false);
    if (event.key.toLowerCase() === "v" && started) videoSoundBtn.click();
  });

  // ---------- Algeria clock ----------
  const clock = $("#clock");
  const date = $("#date");
  function updateClock() {
    const now = new Date();
    const timeZone = profile.timezone || "Africa/Algiers";
    clock.textContent = new Intl.DateTimeFormat("en-DZ", {
      timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).format(now);
    date.textContent = new Intl.DateTimeFormat("en-DZ", {
      timeZone, weekday: "short", day: "2-digit", month: "short"
    }).format(now);
  }
  updateClock();
  window.setInterval(updateClock, 1000);

  // ---------- Desktop cursor ----------
  const cursor = $("#cursor");
  if (window.matchMedia("(pointer:fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener("pointermove", e => { x = e.clientX; y = e.clientY; }, { passive: true });
    const tick = () => {
      cx += (x - cx) * .16;
      cy += (y - cy) * .16;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      requestAnimationFrame(tick);
    };
    tick();
    $$('button').forEach(el => {
      el.addEventListener("pointerenter", () => cursor.classList.add("hover"));
      el.addEventListener("pointerleave", () => cursor.classList.remove("hover"));
    });
  }

  function openExternal(url) {
    try { window.open(url, "_blank", "noopener,noreferrer"); }
    catch { location.href = url; }
  }

  function setupAvatar(imageSelector, initialSelector, src, name) {
    const image = $(imageSelector);
    const initial = $(initialSelector);
    const letter = String(name || "N").trim().charAt(0).toUpperCase() || "N";
    initial.textContent = letter;
    if (!src) return;
    image.src = src;
    image.hidden = false;
    initial.hidden = true;
    image.addEventListener("error", () => {
      image.hidden = true;
      initial.hidden = false;
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
  }
  function escapeAttr(value) { return String(value).replace(/[^a-zA-Z0-9_ -]/g, ""); }
  function escapeClass(value) { return String(value).replace(/[^a-zA-Z0-9_-]/g, ""); }

  renderSound();
})();
