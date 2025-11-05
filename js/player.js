(function () {
  if (window.RadioPlayer && window.RadioPlayer.audio) {
    console.log("🎵 RadioPlayer ya inicializado");
    return;
  }

  console.log("🎵 Inicializando RadioPlayer v1.0.0...");

  const STREAM_HTTP = "http://186.29.40.51:8000/stream";
  const STREAM_HTTPS = "https://radio-conecta-proxy.fly.dev/";
  const STREAM_URL = window.location.protocol === "https:" ? STREAM_HTTPS : STREAM_HTTP;

  const audio = new Audio(STREAM_URL);
  audio.preload = "none";
  audio.crossOrigin = "anonymous";
  audio.playsInline = true;
  audio.loop = false;

  let userPaused = false;
  let reconnectTimer = null;
  let monitorTimer = null;

  // --- 🔔 Alerta visual ---
  function showReconnectAlert(msg = "Reconectando...") {
    let alert = document.getElementById("reconnect-alert");
    if (!alert) {
      alert = document.createElement("div");
      alert.id = "reconnect-alert";
      alert.style.position = "fixed";
      alert.style.bottom = "80px";
      alert.style.left = "50%";
      alert.style.transform = "translateX(-50%)";
      alert.style.background = "rgba(0,0,0,0.8)";
      alert.style.color = "white";
      alert.style.padding = "10px 20px";
      alert.style.borderRadius = "20px";
      alert.style.fontSize = "14px";
      alert.style.zIndex = "9999";
      alert.style.transition = "opacity 0.3s ease";
      document.body.appendChild(alert);
    }
    alert.textContent = msg;
    alert.style.opacity = "1";
  }

  function hideReconnectAlert() {
    const alert = document.getElementById("reconnect-alert");
    if (alert) {
      alert.style.opacity = "0";
      setTimeout(() => alert.remove(), 1000);
    }
  }

  // --- Guardar volumen ---
  try {
    const savedVol = localStorage.getItem("rc_volume");
    if (savedVol !== null) audio.volume = parseFloat(savedVol);
  } catch (_) {}

  audio.addEventListener("volumechange", () => {
    try { localStorage.setItem("rc_volume", String(audio.volume)); } catch (_) {}
    const slider = document.querySelector("#sticky-player input[type='range']");
    if (slider) slider.value = String(Math.round(audio.volume * 100));
  });

  // --- Reconexión ---
  function reconnect() {
    if (userPaused) return;
    showReconnectAlert("Reconectando transmisión...");
    console.log("🔄 Reintentando conexión de stream...");
    clearTimeout(reconnectTimer);
    audio.src = STREAM_URL + "?nocache=" + Date.now();
    audio.load();
    audio.play().then(() => hideReconnectAlert()).catch(() => {
      reconnectTimer = setTimeout(reconnect, 10000);
    });
  }

  ["error", "stalled", "ended"].forEach(evt => {
    audio.addEventListener(evt, () => {
      console.warn(`⚠️ Evento ${evt}, reconectando...`);
      reconnect();
    });
  });

  // --- 🧠 Monitoreo automático del stream cada 30 segundos ---
  function startMonitor() {
    clearInterval(monitorTimer);
    monitorTimer = setInterval(() => {
      if (userPaused) return;

      const ready = audio.readyState;
      const current = audio.currentTime;

      if (ready < 2 || isNaN(current)) {
        console.warn("⚠️ Monitor: stream detenido. Intentando reconectar...");
        reconnect();
        return;
      }

      if (audio.paused === false && current === 0) {
        console.warn("⚠️ Monitor: audio congelado. Reiniciando...");
        reconnect();
        return;
      }

      console.log("🟢 Monitor: stream activo correctamente.");
    }, 30000);
  }

  // --- UI Sticky Player ---
  function ensureStickyPlayer() {
    if (document.getElementById("sticky-player")) return;

    const bar = document.createElement("div");
    bar.id = "sticky-player";
    bar.className = "sticky-player";
    bar.innerHTML = `
      <div class="sp-container">
        <div class="sp-left">
          <img src="img/logo/logo.png" alt="Radio Conecta" class="sp-logo" onerror="this.style.display='none'">
          <div class="sp-info">
            <div class="sp-title">Radio Conecta</div>
            <div class="sp-subtitle">En vivo ahora</div>
          </div>
        </div>
        <div class="sp-center">
          <button class="sp-btn sp-toggle" aria-label="Reproducir/Pausar">
            <svg class="sp-icon sp-play" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3l14 9-14 9V3z"/>
            </svg>
            <svg class="sp-icon sp-pause" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h4v16H6zM14 4h4v16h-4z"/>
            </svg>
          </button>
        </div>
        <div class="sp-right">
          <div class="sp-volume">
            <input class="sp-vol-slider" type="range" min="0" max="100" step="1" value="${Math.round(audio.volume * 100)}" />
          </div>
          <div class="sp-live-badge">
            <span class="sp-live-dot"></span> EN VIVO
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(bar);

    const toggle = bar.querySelector(".sp-toggle");
    const vol = bar.querySelector(".sp-vol-slider");
    const playIcon = bar.querySelector(".sp-play");
    const pauseIcon = bar.querySelector(".sp-pause");

    function syncButton() {
      if (audio.paused) {
        playIcon.style.display = "block";
        pauseIcon.style.display = "none";
      } else {
        playIcon.style.display = "none";
        pauseIcon.style.display = "block";
      }
    }

    toggle.addEventListener("click", async () => {
      try {
        if (audio.paused) {
          userPaused = false;
          await audio.play();
          hideReconnectAlert();
          startMonitor();
        } else {
          userPaused = true;
          audio.pause();
          clearInterval(monitorTimer);
        }
        syncButton();
      } catch (err) {
        console.warn("Play/Pause error:", err);
      }
    });

    vol.addEventListener("input", () => {
      audio.volume = parseInt(vol.value, 10) / 100;
    });

    audio.addEventListener("play", syncButton);
    audio.addEventListener("pause", syncButton);
    syncButton();
  }

  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: "Radio Conecta",
      artist: "En vivo",
      artwork: [{ src: "img/logo/logo.png", sizes: "256x256", type: "image/png" }]
    });
  }

  window.RadioPlayer = {
    audio,
    play: () => { userPaused = false; audio.play(); hideReconnectAlert(); startMonitor(); },
    pause: () => { userPaused = true; audio.pause(); clearInterval(monitorTimer); },
    toggle: () => (audio.paused ? audio.play() : audio.pause()),
    setVolume: (v) => { audio.volume = Math.max(0, Math.min(1, v)); },
    getStreamUrl: () => STREAM_URL
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureStickyPlayer);
  } else {
    ensureStickyPlayer();
  }

  audio.addEventListener("play", startMonitor);
})();
