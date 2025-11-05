# 🔒 Solución: Stream no reproduce en dominio HTTPS

## 🔴 Problema

La radio funciona en `localhost` (HTTP) pero NO funciona en el dominio (HTTPS) debido a **Mixed Content** bloqueado por el navegador.

```
❌ Error: "Mixed Content: The page at 'https://tudominio.com' was loaded over HTTPS, 
   but requested an insecure audio stream 'http://186.29.40.51:8000/stream'"
```

---

## ✅ Solución Implementada

**Cambio realizado en `js/player.js`:**

```javascript
// ANTES (❌)
const STREAM_URL = 'http://186.29.40.51:8000/stream';

// AHORA (✅)
const STREAM_URL = '//186.29.40.51:8000/stream';
```

### ¿Cómo funciona?

- En **localhost** (HTTP) → usará `http://186.29.40.51:8000/stream`
- En **dominio** (HTTPS) → intentará `https://186.29.40.51:8000/stream`

---

## ⚠️ Problema Restante

**Tu servidor de streaming debe soportar HTTPS en el puerto 8000.**

### Verifica si tu servidor acepta HTTPS:

```bash
# Prueba desde terminal
curl -I https://186.29.40.51:8000/stream
```

**Si da error**, necesitas configurar SSL/TLS en tu servidor de streaming.

---

## 🛠️ Soluciones Alternativas

### **Opción 1: Configurar SSL en tu servidor Icecast/Shoutcast**

Para **Icecast2** (Ubuntu/Linux):

```bash
# Instalar certbot
sudo apt install certbot

# Obtener certificado (reemplaza tu dominio)
sudo certbot certonly --standalone -d radio.tudominio.com

# Editar /etc/icecast2/icecast.xml
<listen-socket>
    <port>8000</port>
    <ssl>1</ssl>
</listen-socket>

<paths>
    <ssl-certificate>/etc/letsencrypt/live/radio.tudominio.com/fullchain.pem</ssl-certificate>
    <ssl-private-key>/etc/letsencrypt/live/radio.tudominio.com/privkey.pem</ssl-private-key>
</paths>

# Reiniciar servicio
sudo systemctl restart icecast2
```

### **Opción 2: Proxy Inverso con Nginx (RECOMENDADO)**

Crear proxy HTTPS que redirija al stream HTTP:

```nginx
# /etc/nginx/sites-available/radio-proxy
server {
    listen 443 ssl http2;
    server_name radio.tudominio.com;

    ssl_certificate /etc/letsencrypt/live/radio.tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/radio.tudominio.com/privkey.pem;

    location /stream {
        proxy_pass http://186.29.40.51:8000/stream;
        proxy_set_header Host $host;
        proxy_buffering off;
        
        # Headers para streaming
        add_header Access-Control-Allow-Origin "*";
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

Luego actualiza `player.js`:

```javascript
const STREAM_URL = 'https://radio.tudominio.com/stream';
```

### **Opción 3: Usar Cloudflare como proxy**

1. Apunta un subdominio a `186.29.40.51`
2. Activa el "proxy naranja" en Cloudflare
3. Cloudflare automáticamente proveerá HTTPS
4. Actualiza la URL:

```javascript
const STREAM_URL = 'https://radio.tudominio.com:8000/stream';
```

---

## 🧪 Cómo Probar

### 1. **En localhost (HTTP):**
```bash
# Abrir con servidor local
python3 -m http.server 8080
# Navegar a: http://localhost:8080
```

### 2. **En dominio (HTTPS):**
- Sube los archivos con el cambio
- Abre la consola del navegador (F12)
- Busca errores relacionados con "Mixed Content" o "CORS"

### 3. **Verificar en la consola:**
```javascript
// En la consola del navegador
console.log(RadioPlayer.getStreamUrl());
// Debe mostrar: "//186.29.40.51:8000/stream"
```

---

## 📊 Checklist de Depuración

- [ ] ¿El servidor de streaming está online? (`curl http://186.29.40.51:8000/stream`)
- [ ] ¿Tu dominio usa HTTPS? (candado verde en el navegador)
- [ ] ¿El servidor acepta HTTPS? (`curl https://186.29.40.51:8000/stream`)
- [ ] ¿Hay errores CORS en la consola?
- [ ] ¿Los headers del servidor permiten streaming?

---

## 🆘 Errores Comunes

### Error 1: "net::ERR_SSL_PROTOCOL_ERROR"
**Causa:** El servidor no tiene SSL configurado  
**Solución:** Usar proxy inverso (Nginx) o configurar SSL en Icecast

### Error 2: "Mixed Content blocked"
**Causa:** HTTPS cargando HTTP  
**Solución:** Ya aplicada con `//` en la URL

### Error 3: "CORS policy blocked"
**Causa:** Headers CORS faltantes  
**Solución:** Agregar en tu servidor:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

---

## 📞 Contacto con tu proveedor de streaming

Si no puedes configurar SSL, contacta al administrador del servidor `186.29.40.51` y solicita:

1. Activar HTTPS en el puerto 8000
2. Configurar certificado SSL válido
3. Habilitar headers CORS

---

## ✅ Resultado Esperado

Después de configurar SSL correctamente:

```javascript
✅ Localhost (HTTP)  → http://186.29.40.51:8000/stream  ✓ Funciona
✅ Dominio (HTTPS)   → https://186.29.40.51:8000/stream ✓ Funciona
```

---

**Fecha:** 2 de noviembre de 2025  
**Proyecto:** Radio Conecta
