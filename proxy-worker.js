/**
 * Cloudflare Worker - Proxy HTTPS para Stream de Radio
 * 
 * Este worker actúa como intermediario entre tu sitio HTTPS y el stream HTTP.
 * 
 * INSTRUCCIONES DE INSTALACIÓN:
 * 1. Ve a https://dash.cloudflare.com/
 * 2. Selecciona "Workers & Pages"
 * 3. Haz clic en "Create application" → "Create Worker"
 * 4. Copia y pega este código
 * 5. Despliega
 * 6. Anota la URL del worker (ej: https://radio-proxy.tuusuario.workers.dev)
 * 7. Actualiza player.js con esa URL
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // URL del stream original (HTTP)
  const STREAM_URL = 'http://186.29.40.51:8000/stream'
  
  // Permitir CORS desde cualquier origen
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type',
  }

  // Manejar preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // Hacer request al stream original
    const response = await fetch(STREAM_URL, {
      method: request.method,
      headers: request.headers,
    })

    // Copiar headers de respuesta
    const newHeaders = new Headers(response.headers)
    
    // Agregar headers CORS
    Object.keys(corsHeaders).forEach(key => {
      newHeaders.set(key, corsHeaders[key])
    })

    // Headers importantes para streaming
    newHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    newHeaders.set('Pragma', 'no-cache')
    newHeaders.set('Expires', '0')

    // Retornar stream con headers modificados
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    })

  } catch (error) {
    return new Response('Error al conectar con el stream: ' + error.message, {
      status: 502,
      headers: corsHeaders
    })
  }
}
