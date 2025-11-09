(function () {
  if (window.RadioPlayer && window.RadioPlayer.audio) {
    console.log("🎵 RadioPlayer ya inicializado");
    return;
  }

  console.log("🎵 Inicializando RadioPlayer v1.0.2...");

  const STREAM_HTTP = "http://186.29.40.51:8000/stream";
  const STREAM_HTTPS = "https://radio-conecta-proxy.fly.dev/";
  
  // Detectar protocolo y entorno
  let STREAM_URL;
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  console.log("Entorno:", { protocol, hostname });
  
  // Seleccion de stream:
  // 1. HTTPS produccion -> proxy HTTPS
  // 2. HTTP local (localhost, 127.0.0.1, IPs privadas) -> stream HTTP directo
  // 3. file:// -> proxy HTTPS (fallback)
  
  if (protocol === "https:") {
    console.log("HTTPS detectado - usando proxy HTTPS");
    STREAM_URL = STREAM_HTTPS;
  } else if (protocol === "http:" && (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname === "" || hostname.includes("::"))) {
    console.log("Servidor local HTTP - usando stream HTTP directo");
    STREAM_URL = STREAM_HTTP;
  } else if (protocol === "file:") {
    console.log("Archivo local - usando proxy HTTPS (recomendado: servidor local)");
    STREAM_URL = STREAM_HTTPS;
  } else {
    console.log("Fallback - usando stream HTTP");
    STREAM_URL = STREAM_HTTP;
  }
  
  console.log("Stream URL configurada:", STREAM_URL);

  const audio = new Audio();
  audio.preload = "none";
  audio.crossOrigin = "anonymous";
  audio.playsInline = true;
  audio.loop = false;
  
  // Configurar el stream después de crear el objeto para mejor manejo de errores
  try {
    audio.src = STREAM_URL;
    console.log("✅ Stream URL configurada correctamente");
  } catch (err) {
    console.error("❌ Error al configurar stream:", err);
  }

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

  // --- Restaurar estado de reproducción previo (en caso de recarga completa) ---
  // Usamos sessionStorage para no mantener estado entre pestañas distintas.
  let resumeAttempted = false;
  try {
    const wasPlayingPrev = sessionStorage.getItem("rc_was_playing") === "1";
    // Solo intentamos auto-reproducir si ya hubo una interacción previa del usuario en la sesión
    // (heurística: si existe volumen guardado y hubo reproducción antes).
    if (wasPlayingPrev) {
      // Retrasamos un poco para permitir que otros scripts inicialicen UI.
      setTimeout(() => {
        if (!userPaused && audio.paused) {
          audio.play().then(() => {
            console.log("▶️ Reanudación automática tras recarga completa");
          }).catch(err => {
            console.log("⏸️ No se pudo reanudar automáticamente (política autoplay)", err);
          });
        }
        resumeAttempted = true;
      }, 350);
    }
  } catch(_) {}

  // Persistir estado antes de descargar la página (fallback ante navegación real sin PJAX)
  window.addEventListener("beforeunload", () => {
    try { sessionStorage.setItem("rc_was_playing", (!audio.paused).toString().replace("true","1").replace("false","0")); } catch(_){}
  });

  audio.addEventListener("volumechange", () => {
    try { localStorage.setItem("rc_volume", String(audio.volume)); } catch (_) {}
    const slider = document.querySelector("#sticky-player input[type='range']");
    if (slider) slider.value = String(Math.round(audio.volume * 100));
  });

  // --- Auto-resume defensivo: si el audio se pausa sin que el usuario lo hiciera ---
  audio.addEventListener("pause", () => {
    // Verificar si el audio tiene src antes de intentar reanudar
    if (!audio.src || audio.src === '') {
      console.log("🛑 Audio sin fuente - no reanudar");
      return;
    }
    
    // Condiciones para intentar reanudar:
    // 1. El usuario no pulsó pausa (userPaused == false)
    // 2. No estamos al final (stream en vivo no debe terminar normalmente)
    // 3. La pestaña está visible (evitamos forzar reproducción en background recién abierta)
    if (!userPaused && !audio.ended && document.visibilityState === "visible") {
      // Pequeño debounce: a veces un pause transitorio ocurre antes de un play inmediato del navegador.
      setTimeout(() => {
        if (!userPaused && audio.paused && audio.src && audio.src !== '') {
          console.log("⚠️ Audio pausado inesperadamente. Intentando reanudar...");
          audio.play().catch(err => console.warn("No se pudo auto-reanudar tras pausa inesperada", err));
        }
      }, 400);
    }
  });

  // Reintentar cuando la pestaña vuelve a estar visible (algunos navegadores congelan streams)
  document.addEventListener("visibilitychange", () => {
    // No reanudar si no hay fuente o si está pausado manualmente
    if (document.visibilityState === "visible" && !userPaused && audio.paused && audio.src && audio.src !== '') {
      setTimeout(() => {
        if (!userPaused && audio.paused && audio.src && audio.src !== '') {
          console.log("👁️ Volvió la visibilidad. Reanudando stream...");
          audio.play().catch(()=>{});
        }
      }, 250);
    }
  });

  // --- Reconexión ---
  function reconnect() {
    if (userPaused) {
      console.log("🛑 Reconexión cancelada: usuario pausó");
      return;
    }
    
    // No reconectar si el audio fue limpiado (pestaña cerrada)
    const currentSrc = audio.getAttribute('src') || audio.src;
    if (!currentSrc || currentSrc === '' || currentSrc === window.location.href) {
      console.log("🛑 Reconexión cancelada: audio sin fuente válida");
      clearTimeout(reconnectTimer);
      return;
    }
    
    showReconnectAlert("Reconectando transmisión...");
    console.log("🔄 Reintentando conexión de stream...");
    clearTimeout(reconnectTimer);
    
    try {
      audio.src = STREAM_URL + "?nocache=" + Date.now();
      audio.load();
      audio.play().then(() => {
        console.log("✅ Reconexión exitosa");
        hideReconnectAlert();
      }).catch((err) => {
        console.error("❌ Error en reconexión:", err.message);
        reconnectTimer = setTimeout(reconnect, 10000);
      });
    } catch (err) {
      console.error("❌ Error al intentar reconectar:", err);
      reconnectTimer = setTimeout(reconnect, 10000);
    }
  }

  ["error", "stalled", "ended"].forEach(evt => {
    audio.addEventListener(evt, () => {
      // Verificar que el audio sigue teniendo fuente antes de reconectar
      const currentSrc = audio.getAttribute('src') || audio.src;
      if (!currentSrc || currentSrc === '' || currentSrc === window.location.href) {
        console.log(`🛑 Evento ${evt} ignorado: audio sin fuente`);
        return;
      }
      console.warn(`⚠️ Evento ${evt}, reconectando...`);
      reconnect();
    });
  });

  // --- 🧠 Monitoreo automático del stream cada 30 segundos ---
  function startMonitor() {
    clearInterval(monitorTimer);
    monitorTimer = setInterval(() => {
      if (userPaused) return;
      
      // Verificar que el audio sigue teniendo fuente válida
      const currentSrc = audio.getAttribute('src') || audio.src;
      if (!currentSrc || currentSrc === '' || currentSrc === window.location.href) {
        console.log("🛑 Monitor detenido: audio sin fuente");
        clearInterval(monitorTimer);
        return;
      }

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

  // --- UI Sticky Player DESHABILITADO (ahora se usa radio.html en pestaña separada) ---
  function ensureStickyPlayer() {
    // No crear sticky player - reproductor solo en radio.html
    return;
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
    play: () => { 
      console.log("▶️ Play solicitado - Estado actual:", {
        paused: audio.paused,
        src: audio.src,
        readyState: audio.readyState,
        networkState: audio.networkState
      });
      userPaused = false; 
      hideReconnectAlert(); 
      startMonitor(); 
      return audio.play().catch(err => {
        console.error("❌ Error al reproducir:", err);
        throw err;
      });
    },
    pause: () => { 
      console.log("⏸️ Pause solicitado");
      userPaused = true; 
      audio.pause(); 
      clearInterval(monitorTimer); 
    },
    toggle: () => {
      console.log("🔄 Toggle solicitado - paused:", audio.paused);
      if (audio.paused) {
        return window.RadioPlayer.play();
      } else {
        window.RadioPlayer.pause();
        return Promise.resolve();
      }
    },
    isPlaying: () => !audio.paused,
    setVolume: (v) => { audio.volume = Math.max(0, Math.min(1, v)); },
    getStreamUrl: () => STREAM_URL,
    mute: () => {
      if (audio.volume === 0) return;
      try { window.__lastVolumeBeforeMute = audio.volume; } catch(_){}
      audio.volume = 0;
    },
    unmute: () => {
      const prev = (typeof window.__lastVolumeBeforeMute === 'number' && window.__lastVolumeBeforeMute > 0) ? window.__lastVolumeBeforeMute : 0.6;
      audio.volume = Math.min(1, Math.max(0, prev));
    },
    toggleMute: () => { (audio.volume === 0 ? window.RadioPlayer.unmute() : window.RadioPlayer.mute()); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureStickyPlayer);
  } else {
    ensureStickyPlayer();
  }

  audio.addEventListener("play", startMonitor);
})();
