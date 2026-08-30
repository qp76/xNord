/* =========================================================
   NORD87Q WEBSITE CONFIG
   Edit this file for almost all personalisation.
   ========================================================= */
window.SITE_CONFIG = {
  profile: {
    name: "Nord87q",
    namePrefix: "Nord",
    accentName: "87q",
    eyebrow: "DIGITAL PROFILE",
    bio: "Developer, creator & internet enjoyer.\nWelcome to my space.",
    location: "Algeria",
    timezoneLabel: "UTC+1",
    timezone: "Africa/Algiers",
    footer: "Made in Algeria",
    avatar: "", // Example: "avatar.png"
    welcomeText: "Click enter to visit my profile.",
    accent: "#6fa5ff"
  },

  badges: [
    { icon: "fa-solid fa-code", title: "Developer" },
    { icon: "fa-solid fa-bolt", title: "Creator" }
  ],

  links: [
    { id:"spotify", title:"Spotify", subtitle:"What I'm listening to", icon:"fa-brands fa-spotify", enabled:true, url:"https://open.spotify.com/" },
    { id:"roblox", title:"Roblox", subtitle:"Games & creations", icon:"fa-solid fa-gamepad", enabled:true, url:"https://www.roblox.com/" },
    { id:"github", title:"GitHub", subtitle:"Projects & code", icon:"fa-brands fa-github", enabled:true, url:"https://github.com/qp76" },
    { id:"youtube", title:"YouTube", subtitle:"Videos & content", icon:"fa-brands fa-youtube", enabled:true, url:"https://youtube.com/" },
    { id:"discord", title:"Discord", subtitle:"Chat with me", icon:"fa-brands fa-discord", enabled:true, url:"https://discord.com/" }
  ],

  // These local files are already included in the ZIP. Add/remove/reorder them here.
  videos: [
    "Snaptik_7288236448220777761_sedef-kilic.mp4",
    "Snaptik.app_7288813616575352097.mp4",
    "Snaptik.app_7291154890955443462.mp4",
    "Snaptik_7289443155374542081_tiktok.mp4"
  ],

  // The background video itself is the audio source. There is intentionally no separate music player.
  video: {
    autoplayAfterEnter: true,
    startMuted: true,
    loopPlaylist: true,
    crossfadeMs: 1100
  }
};
