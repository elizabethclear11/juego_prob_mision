# 💾 Sistema de Guardado y Reinicio

## 📋 Resumen de Cambios

Se ha implementado un sistema completo de guardado automático y reinicio manual en el menú principal del juego.

---

## ✨ Nuevas Funcionalidades

### 1. **Botón "Continuar aventura"** 
- **Antes:** "Comenzar aventura" (ambiguo)
- **Ahora:** "Continuar aventura" (indica que hay guardado automático)
- Mantiene toda la partida guardada
- Funciona aunque cierres el navegador

### 2. **Botón "Reiniciar juego"**
- Nuevo botón en el menú principal
- Abre un modal de confirmación
- Advierte sobre la pérdida de progreso
- Requiere confirmación explícita

### 3. **Indicador Visual de Partida Guardada**
- Badge dorado que dice "Partida guardada"
- Aparece solo si hay progreso guardado
- Animación de pulso sutil
- Se actualiza automáticamente

### 4. **Modal de Confirmación**
- Diseño con advertencia clara (⚠️)
- Lista de todo lo que se perderá:
  - ❌ Posición en el camino del dado
  - ❌ Monedas ganadas
  - ❌ Estadísticas de predicción
  - ❌ Misiones completadas
  - ❌ Resultados de cajas, bolsa y ruleta
- Botones: "Sí, reiniciar" (rojo) y "Cancelar"

---

## 🎮 Flujo de Usuario

### Escenario 1: Primera vez jugando
```
1. Usuario entra al juego
2. No hay partida guardada
3. Botón dice "Comenzar aventura"
4. Badge no aparece
5. Usuario comienza a jugar
```

### Escenario 2: Continuando partida
```
1. Usuario regresa al juego
2. Hay partida guardada (detectada automáticamente)
3. Botón dice "Continuar aventura"
4. Badge "Partida guardada" aparece con animación
5. Usuario continúa donde lo dejó
```

### Escenario 3: Reiniciando todo
```
1. Usuario hace clic en "Reiniciar juego"
2. Modal de confirmación aparece
3. Usuario lee la advertencia
4. Opciones:
   a) "Cancelar" → Vuelve al menú sin cambios
   b) "Sí, reiniciar" → Borra todo y reinicia
5. Si confirma: Todo se limpia, chispas se regeneran
6. Badge desaparece
7. Botón vuelve a "Comenzar aventura"
```

---

## 💾 Datos que se Guardan Automáticamente

El juego guarda en `localStorage` bajo la clave `mision-probabilidad-michi`:

```json
{
  "misionesCompletadas": ["dado", "cajas"],
  "resultadosCajas": [...],
  "resultadosBolsa": { "azul": 5, "roja": 3 },
  "resultadosRuleta": [...],
  "posicionDado": 12,
  "dadoLanzamientos": 15,
  "dadoAciertos": 3,
  "monedasDado": 3
}
```

### Persistencia:
- ✅ Sobrevive al cierre del navegador
- ✅ Sobrevive al refrescar la página (F5)
- ✅ Específico por navegador y dispositivo
- ✅ No requiere cuenta ni servidor

---

## 🎨 Diseño Visual

### Badge "Partida guardada"
```css
- Fondo: Dorado translúcido
- Borde: Dorado brillante
- Texto: Dorado claro
- Animación: Pulso suave
- Ubicación: Debajo del botón principal
```

### Modal de Confirmación
```css
- Título: Rojo con ⚠️
- Fondo: Azul oscuro con gradiente
- Lista: Fondo rojo translúcido
- Botones: Primario (rojo) + Secundario (azul)
```

---

## 🔧 Implementación Técnica

### Archivos Modificados

#### 1. **index.html**
```html
<!-- Cambió el botón principal -->
<button class="btn btn-primario" id="btn-comenzar">
  Continuar aventura
  <span class="badge-guardado oculto" id="badge-guardado">
    Partida guardada
  </span>
</button>

<!-- Nuevo botón de reinicio -->
<button class="btn btn-secundario" id="btn-reiniciar-inicio">
  Reiniciar juego
</button>

<!-- Nuevo modal de confirmación -->
<dialog id="modal-reiniciar" class="modal">
  <!-- Contenido del modal -->
</dialog>
```

#### 2. **style.css**
```css
/* Badge de partida guardada */
.badge-guardado {
  /* Estilos del indicador */
}

/* Modal de advertencia */
.modal-advertencia {
  /* Estilos del modal de confirmación */
}
```

#### 3. **script.js**
```javascript
// Nueva función para detectar partida guardada
function actualizarIndicadorPartida() {
  const hayPartida = estado.misionesCompletadas.length > 0 || 
                     estado.posicionDado > 0 ||
                     estado.dadoLanzamientos > 0 ||
                     estado.monedasDado > 0;
  
  if (hayPartida) {
    // Mostrar badge y cambiar texto
  } else {
    // Ocultar badge y texto normal
  }
}

// Eventos del botón reiniciar
document.getElementById('btn-reiniciar-inicio')
  .addEventListener('click', () => {
    modalReiniciar.showModal();
  });

// Confirmación de reinicio
document.getElementById('btn-confirmar-reinicio')
  .addEventListener('click', () => {
    reiniciarJuego();
    modalReiniciar.close();
  });
```

---

## 🧪 Casos de Prueba

### Test 1: Guardado Automático
1. Inicia el juego
2. Juega el minijuego del dado (lanza al menos 1 vez)
3. Cierra la pestaña del navegador
4. Vuelve a abrir `index.html`
5. ✅ Debe aparecer "Continuar aventura" con badge
6. ✅ Al continuar, debe estar en la misma posición

### Test 2: Indicador Dinámico
1. Abre el juego por primera vez
2. ✅ Botón dice "Comenzar aventura" SIN badge
3. Juega hasta ganar 1 moneda
4. Vuelve al menú principal
5. ✅ Botón ahora dice "Continuar aventura" CON badge

### Test 3: Reinicio Completo
1. Juega varias misiones
2. Acumula progreso (monedas, posición, etc.)
3. Haz clic en "Reiniciar juego"
4. ✅ Modal aparece con advertencia
5. Haz clic en "Cancelar"
6. ✅ Nada cambia
7. Haz clic en "Reiniciar juego" otra vez
8. Haz clic en "Sí, reiniciar"
9. ✅ Todo el progreso se borra
10. ✅ Badge desaparece
11. ✅ Botón vuelve a "Comenzar aventura"

### Test 4: Modal Responsivo
1. Abre el juego en móvil o redimensiona la ventana
2. Haz clic en "Reiniciar juego"
3. ✅ Modal debe verse bien en pantalla pequeña
4. ✅ Botones deben ser tocables

### Test 5: Persistencia entre Sesiones
1. Juega y completa el minijuego del dado
2. Anota: posición, monedas, porcentaje
3. Cierra el navegador COMPLETAMENTE
4. Abre el navegador de nuevo
5. Abre `index.html`
6. ✅ Badge aparece
7. Ve al minijuego del dado
8. ✅ Posición, monedas y porcentaje deben ser iguales

---

## 📊 Detección de Partida Guardada

El sistema verifica si hay progreso en:

```javascript
const hayPartida = 
  estado.misionesCompletadas.length > 0 ||  // Alguna misión completada
  estado.posicionDado > 0 ||                // Avanzó en el dado
  estado.dadoLanzamientos > 0 ||            // Lanzó el dado al menos 1 vez
  estado.monedasDado > 0;                   // Ganó al menos 1 moneda
```

Si **cualquiera** de estas condiciones es verdadera → Hay partida guardada

---

## 🎯 Ventajas del Sistema

### Para el Usuario:
1. ✅ **No pierde progreso** al cerrar accidentalmente
2. ✅ **Puede continuar en otro momento** sin perder nada
3. ✅ **Reinicio consciente** con confirmación clara
4. ✅ **Feedback visual** de que hay partida guardada

### Para el Aprendizaje:
1. ✅ **Estadísticas persistentes** (porcentaje de aciertos)
2. ✅ **Progreso acumulativo** (monedas, misiones)
3. ✅ **Puede experimentar** sin miedo a perder progreso
4. ✅ **Opción de reiniciar** para probar de nuevo

### Técnico:
1. ✅ **Sin backend** (todo en localStorage)
2. ✅ **Sin login** requerido
3. ✅ **Rápido y eficiente**
4. ✅ **Compatible con todos los navegadores modernos**

---

## 🚨 Limitaciones

### localStorage:
- ⚠️ Específico por navegador (Chrome ≠ Firefox)
- ⚠️ Específico por dispositivo (PC ≠ móvil)
- ⚠️ Se borra si el usuario limpia caché/datos
- ⚠️ Límite de ~5-10MB (suficiente para este juego)

### Solución para guardar en múltiples dispositivos:
- Requeriría un backend/servidor
- No implementado en esta versión
- Fuera del alcance del proyecto offline

---

## 🎓 Para Educadores

### Conceptos Enseñados:
1. **Persistencia de datos** (localStorage)
2. **Confirmación de acciones destructivas** (UX)
3. **Feedback visual** (badge animado)
4. **Estados de la aplicación** (guardado vs limpio)

### Discusión en Clase:
- ¿Por qué es importante confirmar antes de borrar?
- ¿Qué pasaría si el juego no guardara?
- ¿Cómo sería con una cuenta en la nube?

---

## 📱 Responsive Design

El sistema funciona en:
- ✅ Desktop (1920×1080 y más)
- ✅ Tablet (768×1024)
- ✅ Mobile (375×667 y más)

El modal se adapta automáticamente al tamaño de pantalla.

---

**¡Sistema de guardado y reinicio implementado con éxito!** 💾✨
