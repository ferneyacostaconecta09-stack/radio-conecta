#!/bin/bash

# Script para actualizar el número de versión en todo el proyecto
# Uso: ./update-version.sh 1.0.1

if [ -z "$1" ]; then
  echo "❌ Error: Debes proporcionar un número de versión"
  echo "Uso: ./update-version.sh X.Y.Z"
  echo "Ejemplo: ./update-version.sh 1.0.1"
  exit 1
fi

NEW_VERSION=$1
DATE=$(date +"%d/%m/%Y")

echo "🔄 Actualizando versión a v$NEW_VERSION..."

# Actualizar en archivos HTML
echo "📝 Actualizando archivos HTML..."
for file in index.html radio.html noticias.html top10.html programacion.html contacto.html; do
  if [ -f "$file" ]; then
    sed -i.bak "s/<p class=\"version\">v[0-9]\+\.[0-9]\+\.[0-9]\+ • [0-9/]\+<\/p>/<p class=\"version\">v$NEW_VERSION • $DATE<\/p>/g" "$file"
    rm "${file}.bak"
    echo "  ✓ $file actualizado"
  fi
done

# Actualizar en JavaScript
echo "📝 Actualizando archivos JavaScript..."
if [ -f "js/main.js" ]; then
  sed -i.bak "s/Radio Conecta v[0-9]\+\.[0-9]\+\.[0-9]\+/Radio Conecta v$NEW_VERSION/g" "js/main.js"
  sed -i.bak "s/Última actualización: [0-9/]\+/Última actualización: $DATE/g" "js/main.js"
  rm "js/main.js.bak"
  echo "  ✓ main.js actualizado"
fi

if [ -f "js/player.js" ]; then
  sed -i.bak "s/RadioPlayer v[0-9]\+\.[0-9]\+\.[0-9]\+/RadioPlayer v$NEW_VERSION/g" "js/player.js"
  rm "js/player.js.bak"
  echo "  ✓ player.js actualizado"
fi

echo ""
echo "✅ Versión actualizada a v$NEW_VERSION"
echo "📝 No olvides actualizar VERSION.md con los cambios realizados"
echo ""
