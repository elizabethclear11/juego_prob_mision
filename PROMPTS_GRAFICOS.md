# Guía de gráficos — Misión Probabilidad (Michi Money)

Documento para generar **todas las ilustraciones** del juego con línea gráfica de **gatos exploradores en búsqueda del tesoro**: tonos oscuros, azules profundos, negro, blanco, **dorado**, **café** y **gris**.

---

## 1. Línea gráfica base (copiar en TODOS los prompts)

```
Estilo ilustración digital para videojuego educativo infantil-juvenil (10-14 años),
línea gráfica "Michi Money" — gatos exploradores en búsqueda del tesoro,
atmósfera misteriosa y aventurera NO infantil pastel,
paleta oscura: negro #0A0E14, azul profundo #0D1B2A y #1B2A41, gris #2A2F38 y #4A5568,
acentos de tesoro: dorado #D4A017 y #F0C75E, café/madera #5D4037 y #8D6E63,
texto y brillos en blanco #F5F7FA,
iluminación dramática con resplandor dorado en monedas y objetos importantes,
contornos definidos, sombras profundas, sin realismo fotográfico, sin 3D,
aspecto de aventura nocturna en ruinas o cueva, vectores planos con degradados suaves,
fondo transparente para personajes y objetos, fondo completo oscuro para escenas.
```

### Paleta oficial del juego (actualizada)

| Color | Código | Uso |
|-------|--------|-----|
| Negro profundo | `#0A0E14` | Fondo general |
| Azul oscuro | `#0D1B2A` | Cielo, cuevas, paneles |
| Azul medio | `#1B2A41` | Tarjetas, paneles de misión |
| Azul acento | `#1E3A5F` | Caja azul, ruleta |
| Gris oscuro | `#2A2F38` | Bordes, caja hierro |
| Gris medio | `#4A5568` | Detalles secundarios |
| Blanco suave | `#F5F7FA` | Textos, brillos |
| Dorado | `#D4A017` | Monedas, botones, tesoro |
| Dorado claro | `#F0C75E` | Resplandores, títulos |
| Café | `#5D4037` | Madera, cofres, dado |
| Café claro | `#8D6E63` | Cajas bronce, detalles |

### Formato de archivos

| Tipo | Formato | Fondo |
|------|---------|-------|
| Personajes | PNG o SVG | Transparente |
| Objetos (moneda, dado…) | PNG o SVG | Transparente |
| Fondos / escenas | PNG o WebP | Oscuro completo |
| Iconos del mapa | PNG 128×128 | Transparente o azul oscuro |

---

## 2. Inventario completo de imágenes

### OBLIGATORIAS (8) — El juego ya las espera

| # | Archivo | Carpeta | Pantalla / ID HTML | Tamaño |
|---|---------|---------|-------------------|--------|
| 1 | `gato_explorador.png` | `img/personajes/` | Inicio `#personajePrincipal` y misión dado | Tu archivo actual |
| 2 | `inicio.png` | `img/fondos/` | Fondo `#fondoInicio` | 1920×1080 |
| 3 | `historia.png` | `img/fondos/` | Historia `#historiaImagen` | 800×450 |
| 4 | `mapa.png` | `img/fondos/` | Mapa `#mapaJuego` | 600×900 |
| 5 | `dado-michi.png` | `img/dados/` | Misión dado `#imagenDado` | 300×300 |
| 5.1 | `dado1.png` | `img/dados/` | Carilla dado valor 1 | 200×200 |
| 5.2 | `dado2.png` | `img/dados/` | Carilla dado valor 2 | 200×200 |
| 5.3 | `dado3.png` | `img/dados/` | Carilla dado valor 3 | 200×200 |
| 5.4 | `dado4.png` | `img/dados/` | Carilla dado valor 4 | 200×200 |
| 5.5 | `dado5.png` | `img/dados/` | Carilla dado valor 5 | 200×200 |
| 5.6 | `dado6.png` | `img/dados/` | Carilla dado valor 6 | 200×200 |
| 6 | `cajas-banner.png` | `img/cajas/` | Misión cajas `#imagenCajas` | 700×280 |
| 7 | `bolsa.png` | `img/bolsa/` | Misión bolsa `#imagenBolsa` | 320×400 |
| 8 | `cofre.png` | `img/tesoro/` | Final `#imagenTesoro` | 400×340 |

### RECOMENDADAS (12) — Mejoran interactividad y coherencia

| # | Archivo | Carpeta | Uso |
|---|---------|---------|-----|
| 9 | `michi-caminando.png` | `img/personajes/` | Avance en misión dado |
| 10 | `michi-linterna.png` | `img/personajes/` | Explorando cueva / cajas |
| 11 | `michi-celebrando.png` | `img/personajes/` | Pantalla final y buena suerte |
| 12 | `moneda-dorada.png` | `img/objetos/` | Resultado moneda (cajas/ruleta) |
| 13 | `piedra-gris.png` | `img/objetos/` | Resultado sin premio |
| 14 | `ficha-azul.png` | `img/objetos/` | Bolsa sorpresa |
| 15 | `ficha-plata.png` | `img/objetos/` | Bolsa sorpresa |
| 16 | `llave-antigua.png` | `img/objetos/` | Premio ruleta |
| 17 | `pergamino-pista.png` | `img/objetos/` | Premio ruleta |
| 18 | `cofre-abierto.png` | `img/tesoro/` | Animación final del tesoro |
| 19 | `fondo-mision.png` | `img/fondos/` | Textura de panel para misiones |
| 20 | `logo-titulo.png` | `img/` | Logo "Misión Probabilidad" |

### OPCIONALES (8) — Iconos del mapa y cajas individuales

| # | Archivo | Carpeta | Uso |
|---|---------|---------|-----|
| 21 | `icono-dado.png` | `img/iconos/` | Nodo mapa: Dado |
| 22 | `icono-cajas.png` | `img/iconos/` | Nodo mapa: Cajas |
| 23 | `icono-bolsa.png` | `img/iconos/` | Nodo mapa: Bolsa |
| 24 | `icono-ruleta.png` | `img/iconos/` | Nodo mapa: Ruleta |
| 25 | `icono-tesoro.png` | `img/iconos/` | Nodo mapa: Tesoro |
| 26 | `caja-azul.png` | `img/cajas/` | Caja azul individual |
| 27 | `caja-bronce.png` | `img/cajas/` | Caja bronce individual |
| 28 | `caja-hierro.png` | `img/cajas/` | Caja hierro individual |

**Total: 28 imágenes** (8 obligatorias + 12 recomendadas + 8 opcionales)

---

## 3. Prompts por imagen

> Sustituye `[ESTILO BASE]` por el bloque de la sección 1.

---

### 3.1 Michi Money — Personaje principal

**`img/personajes/michi-principal.png`** · 400×480 · Transparente

```
[ESTILO BASE]

Gato explorador antropomorfo Michi Money, pelaje gris oscuro con subtonos azulados,
chaqueta de cuero café oscuro con botones dorados, cinturón con monedas colgando,
linterna dorada en una pata, gorro de explorador azul marino,
ojos grandes ámbar brillantes, expresión valiente y misteriosa,
de pie en pose de héroe con mapa enrollado en la otra pata,
iluminación desde abajo con resplandor dorado en monedas y linterna,
fondo transparente, sin texto.
```

---

### 3.2 Michi caminando

**`img/personajes/michi-caminando.png`** · 300×300 · Transparente

```
[ESTILO BASE]

Mismo gato Michi Money explorador, vista lateral caminando por túnel oscuro,
linterna encendida proyectando luz dorada, mochila café, cola en movimiento,
silueta sobre fondo transparente, estilo sprite de videojuego 2D de aventura.
```

---

### 3.3 Michi con linterna (cueva)

**`img/personajes/michi-linterna.png`** · 350×400 · Transparente

```
[ESTILO BASE]

Michi Money asomándose con linterna dorada iluminando la escena,
expresión curiosa, ojos reflejando luz dorada, entorno sugerido solo con sombras,
fondo transparente, ideal para misión de cajas misteriosas.
```

---

### 3.4 Michi celebrando

**`img/personajes/michi-celebrando.png`** · 350×400 · Transparente

```
[ESTILO BASE]

Michi Money saltando de alegría rodeado de monedas doradas flotantes,
brazos arriba, confeti dorado y blanco, expresión de victoria,
resplandor dorado intenso, fondo transparente.
```

---

### 3.5 Fondo pantalla de inicio

**`img/fondos/inicio.png`** · 1920×1080

```
[ESTILO BASE]

Paisaje nocturno de búsqueda del tesoro: ruinas de templo antiguo bajo cielo azul oscuro
con estrellas y luna tenue, niebla gris en el suelo, antorchas con luz dorada,
sendero de piedra hacia una cueva brillante al fondo,
monedas doradas semienterradas entre rocas, siluetas lejanas de estatuas de gatos,
atmósfera misteriosa y épica, sin personaje principal grande,
espacio central libre para UI y personaje, sin texto.
```

---

### 3.6 Escena de historia

**`img/fondos/historia.png`** · 800×450

```
[ESTILO BASE]

Michi Money gato explorador descubriendo un mapa del tesoro antiguo
sobre mesa de piedra en cámara subterránea oscura,
mapa con ruta punteada hacia cofre (sin texto legible), velas doradas,
paredes de roca azul grisácea, luz cálida dorada contrastando con sombras profundas,
estilo ilustración de aventura juvenil oscura.
```

---

### 3.7 Mapa del camino

**`img/fondos/mapa.png`** · 600×900 · Vertical

```
[ESTILO BASE]

Mapa ilustrado vertical estilo pergamino oscuro sobre fondo azul noche,
camino de piedras en zigzag con cinco paradas marcadas con iconos dorados:
dado, tres cofres, bolsa, ruleta, cofre del tesoro,
pequeñas huellas de gato en el sendero, bordes desgastados café,
detalles en dorado y gris, sin texto, aspecto de mapa de explorador antiguo.
```

---

### 3.8 Fondo de misiones (textura)

**`img/fondos/fondo-mision.png`** · 800×600 · Tileable

```
[ESTILO BASE]

Textura de pared de cueva o piedra azul grisácea con grietas sutiles,
vetas doradas mínimas, patrón repetible para fondo de panel,
oscuro y atmosférico, sin objetos, sin texto.
```

---

### 3.9 Dado del tesoro

**`img/dados/dado-michi.png`** · 300×300 · Transparente

```
[ESTILO BASE]

Dado de madera café oscuro con bordes dorados tallados,
caras con puntos dorados brillantes (estilo huella de gata en lugar de puntos),
un lado con símbolo de cofre dorado, aspecto artefacto antiguo de explorador,
sombra profunda, resplandor dorado suave, fondo transparente, vista 3/4.
```

---

### 3.9.1 Carillas individuales del dado (minijuego 1)

Estas carillas se mostrarán cuando el dado se lance en el minijuego. Cada cara del dado debe ser una vista frontal plana que muestre el número correspondiente.

**`img/dados/dado1.png`** · 200×200 · Transparente

```
[ESTILO BASE]

Cara frontal de dado de madera café oscuro #5D4037,
una sola huella de gato dorada #D4A017 brillante en el centro,
bordes con talla ornamental dorada sutil,
textura de madera antigua con vetas apenas visibles,
resplandor dorado suave alrededor de la huella,
vista frontal perfectamente plana, fondo transparente.
```

**`img/dados/dado2.png`** · 200×200 · Transparente

```
[ESTILO BASE]

Cara frontal de dado de madera café oscuro #5D4037,
dos huellas de gato doradas #D4A017 brillantes en diagonal (esquina superior izquierda a esquina inferior derecha),
bordes con talla ornamental dorada sutil,
textura de madera antigua con vetas apenas visibles,
resplandor dorado suave alrededor de las huellas,
vista frontal perfectamente plana, fondo transparente.
```

**`img/dados/dado3.png`** · 200×200 · Transparente

```
[ESTILO BASE]

Cara frontal de dado de madera café oscuro #5D4037,
tres huellas de gato doradas #D4A017 brillantes en diagonal (una arriba izquierda, una centro, una abajo derecha),
bordes con talla ornamental dorada sutil,
textura de madera antigua con vetas apenas visibles,
resplandor dorado suave alrededor de las huellas,
vista frontal perfectamente plana, fondo transparente.
```

**`img/dados/dado4.png`** · 200×200 · Transparente

```
[ESTILO BASE]

Cara frontal de dado de madera café oscuro #5D4037,
cuatro huellas de gato doradas #D4A017 brillantes en las cuatro esquinas,
bordes con talla ornamental dorada sutil,
textura de madera antigua con vetas apenas visibles,
resplandor dorado suave alrededor de las huellas,
vista frontal perfectamente plana, fondo transparente.
```

**`img/dados/dado5.png`** · 200×200 · Transparente

```
[ESTILO BASE]

Cara frontal de dado de madera café oscuro #5D4037,
cinco huellas de gato doradas #D4A017 brillantes (cuatro en las esquinas y una en el centro),
bordes con talla ornamental dorada sutil,
textura de madera antigua con vetas apenas visibles,
resplandor dorado suave alrededor de las huellas,
vista frontal perfectamente plana, fondo transparente.
```

**`img/dados/dado6.png`** · 200×200 · Transparente

```
[ESTILO BASE]

Cara frontal de dado de madera café oscuro #5D4037,
seis huellas de gato doradas #D4A017 brillantes en dos columnas verticales de tres huellas cada una,
bordes con talla ornamental dorada sutil,
textura de madera antigua con vetas apenas visibles,
resplandor dorado suave alrededor de las huellas,
vista frontal perfectamente plana, fondo transparente.
```

---

### 3.10 Banner tres cajas

**`img/cajas/cajas-banner.png`** · 700×280 · Transparente

```
[ESTILO BASE]

Tres cofres alineados en cueva oscura: uno azul marino, uno bronce/café, uno gris hierro,
todos con cerraduras y ribetes dorados, brillo misterioso saliendo de las rendijas,
Michi Money asomándose desde las sombras con linterna,
iluminación dramática dorada sobre fondo azul negro, sin texto.
```

---

### 3.11 Caja azul / bronce / hierro (individuales)

**`img/cajas/caja-azul.png`** · 200×220 · Transparente

```
[ESTILO BASE]

Un cofre de tesoro azul marino oscuro #1E3A5F con detalles dorados,
cerradura dorada con huella de gato, luz dorada filtrándose por las rendijas,
vista frontal, fondo transparente.
```

**`img/cajas/caja-bronce.png`** — Igual pero cofre bronce/café `#6D4C41`.

**`img/cajas/caja-hierro.png`** — Igual pero cofre gris hierro `#37474F` con óxido sutil.

---

### 3.12 Bolsa sorpresa

**`img/bolsa/bolsa.png`** · 320×400 · Transparente

```
[ESTILO BASE]

Bolsa de tela café oscuro con cordón dorado, parche bordado de gato explorador,
bolsa hinchada con fichas azules y plateadas asomando,
colgando en ambiente de cueva con luz dorada lateral,
estilo objeto interactivo de videojuego, fondo transparente, sombra suave.
```

---

### 3.13 Moneda dorada

**`img/objetos/moneda-dorada.png`** · 150×150 · Transparente

```
[ESTILO BASE]

Moneda de oro antigua grande con relieve de gato explorador y runas circulares,
brillo dorado intenso #D4A017, borde tallado, aspecto tesoro pirata elegante,
fondo transparente, luz de resplandor.
```

---

### 3.14 Piedra gris

**`img/objetos/piedra-gris.png`** · 150×150 · Transparente

```
[ESTILO BASE]

Piedra gris redonda mate #4A5568, textura rocosa simple,
pequeña cara triste pero graciosa estilo cartoon oscuro,
sin brillo, fondo transparente, no amenazante.
```

---

### 3.15 Ficha azul y ficha plata

**`img/objetos/ficha-azul.png`** · 120×120 · Transparente

```
[ESTILO BASE]

Ficha circular de metal azul profundo #2563EB con borde dorado,
símbolo de huella de gato en el centro en plata, brillo sutil, fondo transparente.
```

**`img/objetos/ficha-plata.png`** — Igual pero metal plateado/gris `#90A4AE`.

---

### 3.16 Llave antigua

**`img/objetos/llave-antigua.png`** · 150×150 · Transparente

```
[ESTILO BASE]

Llave dorada antigua ornamentada, mango con forma de cola de gato,
brillo mágico dorado, estilo artefacto de templo olvidado, fondo transparente.
```

---

### 3.17 Pergamino pista

**`img/objetos/pergamino-pista.png`** · 180×140 · Transparente

```
[ESTILO BASE]

Pergamino café enrollado parcialmente con dibujo de cofre y huellas de gato,
sin texto legible, bordes quemados, cinta dorada, fondo transparente.
```

---

### 3.18 Ruleta decorativa (opcional)

**`img/ruleta/ruleta-decorativa.png`** · 500×500 · Transparente

```
[ESTILO BASE]

Ruleta de la fortuna vista cenital, marco dorado sobre disco oscuro,
cuatro secciones: dorado (moneda), azul (llave), café (pergamino), gris (piedra),
centro con medallón de gato explorador, estilo casino antiguo misterioso,
fondo transparente.
```

---

### 3.19 Cofre cerrado

**`img/tesoro/cofre.png`** · 400×340 · Transparente

```
[ESTILO BASE]

Cofre del tesoro grande de madera café oscuro con refuerzos de hierro gris y oro,
cerradura en forma de huella de gato dorada, grabados de gatos exploradores,
monedas doradas asomando, gemas azules oscuras incrustadas,
luz dorada mágica filtrándose por las rendijas, fondo transparente.
```

---

### 3.20 Cofre abierto

**`img/tesoro/cofre-abierto.png`** · 400×380 · Transparente

```
[ESTILO BASE]

Mismo cofre Michi Money con tapa abierta hacia atrás,
explosión de monedas doradas y luz blanca-dorada,
partículas doradas y grises, estilo celebración de tesoro encontrado,
fondo transparente.
```

---

### 3.21 Logo del juego

**`img/logo-titulo.png`** · 600×200 · Transparente

```
[ESTILO BASE]

Logo tipográfico "MISIÓN PROBABILIDAD" en letras blancas y doradas estilo explorador,
pequeño gato con sombrero y linterna integrado en la composición,
fondo transparente, efecto de brillo dorado en bordes de letras.
```

---

### 3.22 Iconos del mapa (×5)

**`img/iconos/icono-dado.png`** · 128×128 · Transparente

```
[ESTILO BASE]

Icono cuadrado redondeado fondo azul oscuro #1B2A41,
dado de madera café con puntos dorados en el centro, borde dorado fino,
estilo UI de videojuego oscuro, sin texto.
```

Repetir variando el símbolo central:
- **icono-cajas.png** → tres mini cofres
- **icono-bolsa.png** → bolsa café con cordón dorado
- **icono-ruleta.png** → ruleta dorada
- **icono-tesoro.png** → cofre con monedas

---

## 4. Cómo instalar las imágenes

1. Exporta en **PNG** (transparencia) o **WebP**.
2. Coloca cada archivo en la carpeta indicada.
3. En `index.html`, cambia cada `src`:

```html
<img src="img/personajes/michi-principal.png" alt="Michi Money">
```

4. Fondo de inicio en `style.css`:

```css
.fondo-imagen {
  background: url('img/fondos/inicio.png') center/cover no-repeat;
}
```

5. **IMPORTANTE - Carillas del dado**: Las imágenes `dado1.png` a `dado6.png` deben ser vistas frontales planas que se intercambiarán dinámicamente en el juego. El archivo `dado-michi.png` es el dado en 3D que se muestra inicialmente, pero cuando se lanza, la imagen cambia a la carilla correspondiente (dado1.png, dado2.png, etc.) según el número obtenido.

6. Comprime con [TinyPNG](https://tinypng.com) para uso sin internet.

### Instrucciones específicas para las carillas del dado

Las carillas del dado (dado1.png - dado6.png) deben:
- Ser vistas frontales perfectamente planas (sin perspectiva 3D)
- Mostrar solo una cara del dado
- Mantener coherencia visual con el dado principal (mismo color café oscuro, mismas huellas doradas)
- Tener el mismo tamaño (200×200 px)
- Ser fácilmente intercambiables en el juego

**Flujo en el juego:**
1. Al inicio se muestra `dado-michi.png` (dado completo en 3D)
2. Al hacer clic en "Lanzar dado", el dado gira
3. Al finalizar el giro, la imagen cambia a `dadoX.png` donde X es el número obtenido (1-6)
4. Esto crea el efecto de que el dado "cayó" mostrando ese número

---

## 5. Coherencia visual — Reglas de oro

1. **Genera primero** `michi-principal.png` y úsalo como referencia en los demás prompts.
2. **Siempre** fondos oscuros azul/negro; el dorado solo en tesoro, monedas y luces.
3. **Evita** colores pastel, rosas brillantes y verdes claros.
4. Las **cajas** se distinguen por material: azul marino · bronce/café · hierro/gris.
5. La **bolsa** usa fichas azul y plata (no rojo).
6. Mantén **el mismo diseño de Michi** (ropa café, gorro azul, linterna dorada).

---

## 6. Ideas para mejorar el juego (con estos gráficos)

### Interactividad visual
- [ ] Cambiar la expresión de Michi según el mensaje (feliz / pensando / linterna).
- [ ] Usar `moneda-dorada.png` y `piedra-gris.png` en lugar de emoji en cajas.
- [ ] Reemplazar fichas emoji por `ficha-azul.png` y `ficha-plata.png`.
- [ ] Animar cofre: alternar `cofre.png` → `cofre-abierto.png` al final.

### Ambiente
- [ ] Fondo distinto por misión: túnel (dado), cámara (cajas), mercado oscuro (bolsa), salón (ruleta), cámara del tesoro (final).
- [ ] `fondo-mision.png` como textura detrás de cada panel.

### Sonido (carpeta `audio/`)
- [ ] `dado.mp3`, `caja.mp3`, `bolsa.mp3`, `ruleta.mp3`, `tesoro.mp3` — tonos graves con brillo metálico.

### Aprendizaje (sin cuestionario)
- [ ] Tras el gráfico de barras: *"¿Viste que un color salió más?"*
- [ ] Diario visual al final con iconos de lo encontrado en cada misión.

---

## 7. Checklist de producción

```
OBLIGATORIAS
[ ] michi-principal.png
[ ] inicio.png
[ ] historia.png
[ ] mapa.png
[ ] dado-michi.png
[ ] dado1.png (carilla con 1)
[ ] dado2.png (carilla con 2)
[ ] dado3.png (carilla con 3)
[ ] dado4.png (carilla con 4)
[ ] dado5.png (carilla con 5)
[ ] dado6.png (carilla con 6)
[ ] cajas-banner.png
[ ] bolsa.png
[ ] cofre.png

RECOMENDADAS
[ ] michi-caminando.png
[ ] michi-linterna.png
[ ] michi-celebrando.png
[ ] moneda-dorada.png
[ ] piedra-gris.png
[ ] ficha-azul.png + ficha-plata.png
[ ] llave-antigua.png + pergamino-pista.png
[ ] cofre-abierto.png
[ ] logo-titulo.png

OPCIONALES
[ ] 5 iconos del mapa
[ ] 3 cajas individuales
[ ] ruleta-decorativa.png

INSTALACIÓN
[ ] Rutas actualizadas en index.html
[ ] Fondo actualizado en style.css
[ ] Probado en móvil y escritorio
```

---

## 8. Herramientas sugeridas

| Herramienta | Uso |
|-------------|-----|
| **Midjourney** | Escenas oscuras, cofres, cuevas |
| **DALL·E 3** | Personaje Michi, iconos, objetos |
| **Ideogram** | Logo y tipografía |
| **Figma** | Unificar paleta y exportar assets |
| **Remove.bg** | Quitar fondos de PNG generados |

**Tip img2img:** Sube `michi-principal.png` como referencia de estilo en todos los prompts de personaje y objetos.

---

*Actualizado para tema oscuro: búsqueda del tesoro · azul · negro · dorado · café · gris.*
