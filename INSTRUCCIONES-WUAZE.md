# 🔧 Solución para https://radioconecta.wuaze.com

## 🔴 Problema Actual

Tu sitio está en **HTTPS** pero el stream es **HTTP**, causando que los navegadores bloqueen la reproducción por seguridad (Mixed Content).

```
✅ Sitio: https://radioconecta.wuaze.com/ (HTTPS)
❌ Stream: http://186.29.40.51:8000/stream (HTTP)
🚫 Resultado: BLOQUEADO
```

## ✅ Soluciones Prácticas

### **Opción 1: Cloudflare Worker (GRATIS y FÁCIL)** ⭐ RECOMENDADA

1. **Crea una cuenta en Cloudflare** (si no tienes): https://dash.cloudflare.com/sign-up

2. **Crea un Worker:**
   - Ve a `Workers & Pages` en el menú izquierdo
   - Clic en `Create Application`
   - Selecciona `Create Worker`
   - Dale un nombre: `radio-conecta-proxy`

3. **Copia y pega este código en el editor:**

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const STREAM_URL = 'http://186.29.40.51:8000/stream'
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type',
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const response = await fetch(STREAM_URL, {
      method: request.method,
      headers: request.headers,
    })

    const newHeaders = new Headers(response.headers)
    Object.keys(corsHeaders).forEach(key => {
      newHeaders.set(key, corsHeaders[key])
    })
    newHeaders.set('Cache-Control', 'no-cache')

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    })
  } catch (error) {
    return new Response('Error: ' + error.message, {
      status: 502,
      headers: corsHeaders
    })
  }
}
```

4. **Despliega el Worker:**
   - Haz clic en `Deploy`
   - Copia la URL que te dan (ejemplo: `https://radio-conecta-proxy.tu-usuario.workers.dev`)

5. **Actualiza `js/player.js` con la nueva URL:**

```javascript
// Línea 9 aproximadamente
const STREAM_HTTPS = 'https://radio-conecta-proxy.tu-usuario.workers.dev';
```

6. **Sube el archivo actualizado a tu servidor Wuaze**

---

### **Opción 2: Agregar subdomain proxy en Wuaze**

Si Wuaze te permite configurar proxies o redirecciones:

1. **Crea un archivo PHP** `stream-proxy.php`:

```php
<?php
header('Content-Type: audio/mpeg');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');

$stream_url = 'http://186.29.40.51:8000/stream';

// Iniciar stream
$ch = curl_init($stream_url);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch, CURLOPT_BUFFERSIZE, 1024);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $data) {
    echo $data;
    flush();
    return strlen($data);
});

curl_exec($ch);
curl_close($ch);
?>
```

2. **Sube el archivo a tu servidor**

3. **Actualiza `js/player.js`:**

```javascript
const STREAM_HTTPS = 'https://radioconecta.wuaze.com/stream-proxy.php';
```

---

### **Opción 3: Contactar al proveedor del servidor 186.29.40.51**

Solicita al administrador del servidor que:
- Active HTTPS en el puerto 8000
- Instale certificado SSL
- Configure headers CORS

---

## 🚀 Pasos Rápidos (Opción 1 - Cloudflare)

```bash
# Paso 1: Crear Worker en Cloudflare
1. https://dash.cloudflare.com/
2. Workers & Pages → Create Worker
3. Pegar código del proxy
4. Deploy
5. Copiar URL (ej: https://radio-proxy.usuario.workers.dev)

# Paso 2: Actualizar código local
# Editar js/player.js línea 12:
const STREAM_HTTPS = 'https://TU-WORKER.workers.dev';

# Paso 3: Subir a Wuaze
# Usa FTP, File Manager o Git para subir el archivo actualizado
```

---

## 🧪 Verificar que funciona

1. Abre: https://radioconecta.wuaze.com/test-stream.html
2. Haz clic en "Probar con HTTPS (fuerza)"
3. Si reproduce, ¡listo! ✅

O verifica directamente en:
- https://radioconecta.wuaze.com/radio.html
- Haz clic en play
- Abre consola del navegador (F12)
- No deberían aparecer errores de "Mixed Content"

---

## 📞 Ayuda Adicional

**Si usas Wuaze File Manager:**
1. Inicia sesión en tu panel de Wuaze
2. Ve a "Administrador de archivos"
3. Navega a la carpeta `js/`
4. Edita `player.js`
5. Busca la línea con `STREAM_HTTPS`
6. Cambia por la URL del Worker
7. Guarda

**Si usas FTP:**
```bash
# Conectar con FileZilla o tu cliente FTP
Host: ftp.wuaze.com (o tu host específico)
Usuario: tu_usuario
Contraseña: tu_contraseña

# Navegar a:
/public_html/js/player.js

# Descargar, editar, y volver a subir
```

---

## ⚡ Solución Temporal (mientras configuras el proxy)

Si necesitas que funcione YA (temporalmente):

Agrega esta línea al inicio de tu `index.html`, `radio.html`, etc.:

```html
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
```

Esto forzará al navegador a intentar HTTPS, pero fallará si el servidor no lo soporta.

---

## 📊 Estado Actual

- ✅ Código actualizado para detectar protocolo
- ✅ Manejo de errores mejorado
- ✅ Notificaciones visuales implementadas
- ⏳ **Pendiente:** Configurar proxy HTTPS (Opción 1 recomendada)

---

**Última actualización:** 2 de noviembre de 2025  
**Dominio:** https://radioconecta.wuaze.com/  
**Stream:** http://186.29.40.51:8000/stream
