# 🎵 Radio Conecta

**Emisora online - Más que radio, somos tu compañía**

## 📋 Descripción

Radio Conecta es una emisora online con transmisión en vivo 24/7, que ofrece:
- 🎧 Reproductor de streaming en vivo
- 📰 Noticias musicales actualizadas
- 🔥 Top 10 de la semana con previews
- 📅 Programación semanal
- 💬 Formulario de contacto
- 📱 Integración con redes sociales

## 🚀 Características Técnicas

- **Navegación PJAX**: El audio continúa reproduciéndose al navegar entre páginas
- **Sticky Player**: Reproductor persistente en la parte inferior
- **Responsive**: Diseño adaptado para móviles y tablets
- **Reconexión automática**: El stream se reconecta automáticamente si hay interrupciones
- **Monitoreo activo**: Sistema de verificación del estado del stream cada 30 segundos
- **Proxy HTTPS**: Soporte para reproducción en sitios HTTPS

## 📁 Estructura del Proyecto

```
radio-conecta/
├── index.html           # Página principal
├── radio.html          # Reproductor en vivo
├── noticias.html       # Sección de noticias
├── top10.html          # Top 10 completo
├── programacion.html   # Horarios semanales
├── contacto.html       # Formulario de contacto
├── css/
│   └── estilos.css     # Estilos generales
├── js/
│   ├── main.js         # Funcionalidad principal
│   └── player.js       # Reproductor de radio
├── img/                # Imágenes y recursos
├── audio/              # Previews de audio
├── VERSION.md          # Control de versiones
└── update-version.sh   # Script para actualizar versión
```

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/ferneyacostaconecta09-stack/radio-conecta.git
cd radio-conecta
```

2. Abre el proyecto en tu navegador:
```bash
# Puedes usar cualquier servidor local, por ejemplo:
python -m http.server 8000
# o
npx http-server
```

3. Accede a `http://localhost:8000` en tu navegador

## 📝 Control de Versiones

La versión actual se muestra en el footer de todas las páginas.

### Ver versión actual
- Mira el footer de cualquier página
- Revisa la consola del navegador (F12)
- Consulta el archivo `VERSION.md`

### Actualizar versión

Usa el script automatizado:
```bash
./update-version.sh 1.0.1
```

Esto actualizará:
- Todos los archivos HTML
- Archivos JavaScript
- Fecha de actualización

**No olvides actualizar `VERSION.md` manualmente con los cambios realizados.**

## 🌐 Stream de Radio

- **HTTP**: `http://186.29.40.51:8000/stream`
- **HTTPS Proxy**: `https://radio-conecta-proxy.fly.dev/`

El sistema detecta automáticamente el protocolo y usa el apropiado.

## 🎨 Personalización

### Cambiar colores principales
Edita `css/estilos.css` y busca:
- `#00b7ff` - Color azul principal
- `#ff8800` - Color naranja/dorado
- `#ff9500` - Color destacado

### Modificar URL del stream
Edita `js/player.js` líneas 8-10:
```javascript
const STREAM_HTTP = "tu-url-http";
const STREAM_HTTPS = "tu-url-https";
```

## 📱 Redes Sociales

Actualiza los enlaces en todas las páginas HTML buscando la sección de redes sociales.

## 🐛 Problemas Conocidos

- El stream puede tardar unos segundos en iniciar en la primera carga
- En algunos navegadores móviles se requiere interacción del usuario antes de reproducir

## 📄 Licencia

© 2025 Radio Conecta - Todos los derechos reservados

## 👤 Autor

**Ferney Acosta**
- GitHub: [@ferneyacostaconecta09-stack](https://github.com/ferneyacostaconecta09-stack)

---

**Versión actual**: v1.0.0 (05/11/2025)
