# Stored XSS Detection Tool

## Overview
Esta herramienta detecta vulnerabilidades de Cross-Site Scripting (XSS) almacenado en bases de datos.

## Características
- Análisis de campos de texto en la base de datos
- Detección de patrones de código malicioso
- Validación de entrada/salida

## Uso
```bash
python -m http.server 9091
```

## Patrones Detectados
- `<script>` tags
- Event handlers (onclick, onload, etc.)
- JavaScript protocols (javascript:)
- Data URIs con contenido ejecutable

## Resultados
La herramienta muestra un detalle con:
- Campo afectado
- Valor malicioso
- Verificacion en la DB con xss