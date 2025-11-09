# 🚀 Instrucciones para ejecutar Radio Conecta localmente

## ⚠️ IMPORTANTE: No abras los archivos HTML directamente

Abrir `index.html` o `radio.html` haciendo doble clic causará errores de seguridad y el stream no se reproducirá correctamente.

## ✅ Método correcto: Usar un servidor local

### Opción 1: Python (recomendado - más fácil)

1. Abre la Terminal
2. Navega a la carpeta del proyecto:
   ```bash
   cd /Users/williamferneyacostaruiz/Downloads/radio-conecta
   ```

3. Inicia el servidor:
   ```bash
   python3 -m http.server 8080
   ```

4. Abre el navegador y ve a:
   ```
   http://localhost:8080
   ```

5. Para detener el servidor: presiona `Ctrl + C` en la Terminal

### Opción 2: Node.js (si tienes Node instalado)

1. Instala el servidor (solo una vez):
   ```bash
   npm install -g http-server
   ```

2. En la carpeta del proyecto, ejecuta:
   ```bash
   http-server -p 8080
   ```

3. Abre: `http://localhost:8080`

### Opción 3: VS Code Live Server (extensión)

1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `index.html`
3. Selecciona "Open with Live Server"

## 🔧 Verificación

Cuando el reproductor esté funcionando correctamente, verás en la consola del navegador (F12):

```
Entorno: { protocol: "http:", hostname: "localhost" }
Servidor local HTTP - usando stream HTTP directo
Stream URL configurada: http://186.29.40.51:8000/stream
```

## 🌐 Para publicar en internet

Cuando subas el sitio a un servidor web con HTTPS (como GitHub Pages, Netlify, Vercel), el reproductor automáticamente usará el proxy HTTPS:

```
Entorno: { protocol: "https:", hostname: "tu-sitio.com" }
HTTPS detectado - usando proxy HTTPS
Stream URL configurada: https://radio-conecta-proxy.fly.dev/
```

## ❓ Solución de problemas

### El stream no se reproduce

1. ✅ Verifica que estés usando un servidor local (no `file://`)
2. ✅ Revisa la consola del navegador (F12) para ver errores
3. ✅ Prueba el stream directamente: http://186.29.40.51:8000/stream
4. ✅ Verifica que el servidor de radio esté funcionando

### Mixed Content Error

- Asegúrate de que estés en `http://localhost` o `https://` con proxy
- No uses `file://` directamente

### CORS Error

- El proxy debe estar configurado en Fly.io o Cloudflare Workers
- Verifica que `https://radio-conecta-proxy.fly.dev/` esté respondiendo

## 📱 Pruebas en móvil

Para probar en tu teléfono desde la misma red Wi-Fi:

1. Encuentra tu IP local:
   ```bash
   ipconfig getifaddr en0
   # Ejemplo: 192.168.1.100
   ```

2. Inicia el servidor:
   ```bash
   python3 -m http.server 8080
   ```

3. En tu móvil, abre:
   ```
   http://192.168.1.100:8080
   ```
