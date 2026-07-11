# 🎮 Instrucciones para Probar el Minijuego del Dado

## 📋 Pasos Rápidos

### 1. Abrir el Juego
```
Abre el archivo index.html en tu navegador
```

### 2. Navegar al Minijuego del Dado
1. Clic en "Comenzar aventura"
2. Clic en "¡Explorar el mapa!"
3. Clic en el punto "Dado" (primer punto disponible en el mapa)

### 3. Jugar el Minijuego

#### Predecir y Lanzar:
1. **Ingresa tu predicción**: Escribe un número del 1 al 6 en el campo "Resultado esperado"
2. **Lanza el dado**: Haz clic en "Lanzar dado" (o presiona Enter)
3. **Observa el resultado**:
   - El dado gira y muestra la carilla correspondiente
   - Ve si tu predicción fue correcta o incorrecta
   - Si aciertas: ¡Ganas una moneda! 💰

#### Sistema de Recompensas:
- ✅ **Predicción correcta** = +1 Moneda + Avanzas en el camino
- ❌ **Predicción incorrecta** = Solo avanzas en el camino
- 📊 **Porcentaje de aciertos** se actualiza cada vez

#### Meta:
- Llega a la posición **15** para completar la misión
- Al llegar: Un cofre se abre y revela una **llave dorada** 🗝️
- La llave desbloquea el siguiente nivel

---

## 🎯 Conceptos de Probabilidad que Aprenderás

### Probabilidad Básica
- Un dado tiene 6 caras
- Cada número tiene **1/6 de probabilidad** (≈ 16.67%)
- Es difícil predecir correctamente más del 20% de las veces

### Ejemplos de Porcentajes Esperados:

| Lanzamientos | Aciertos | Porcentaje |
|--------------|----------|------------|
| 6            | 1        | 17% ✓ Normal |
| 10           | 2        | 20% ✓ Bueno |
| 10           | 5        | 50% ⚠️ ¡Muy afortunado! |
| 20           | 3        | 15% ✓ Esperado |
| 20           | 10       | 50% ⚠️ Imposible estadísticamente |

**Nota:** Si tu porcentaje está cerca del 16-17%, ¡estás jugando según la probabilidad real!

---

## 🖼️ Imágenes Necesarias

### ⚠️ IMPORTANTE - Genera estas imágenes primero

El juego necesita las siguientes imágenes en `img/dados/`:

```
img/dados/
├── dado-michi.png    (Dado 3D inicial - ya existe)
├── dado1.png         (Carilla con 1 huella) ⬅️ CREAR
├── dado2.png         (Carilla con 2 huellas) ⬅️ CREAR
├── dado3.png         (Carilla con 3 huellas) ⬅️ CREAR
├── dado4.png         (Carilla con 4 huellas) ⬅️ CREAR
├── dado5.png         (Carilla con 5 huellas) ⬅️ CREAR
└── dado6.png         (Carilla con 6 huellas) ⬅️ CREAR
```

### Cómo generar las carillas:
1. Ve a `PROMPTS_GRAFICOS.md`
2. Busca la sección **3.9.1 Carillas individuales del dado**
3. Usa cada prompt con tu generador de imágenes IA
4. Guarda cada imagen con el nombre correspondiente

---

## 🧪 Pruebas Recomendadas

### Test 1: Predicción Básica
1. Predice "3" varias veces seguidas
2. Observa que el dado sale con diferentes números
3. Verifica que el porcentaje baja (es difícil acertar siempre)

### Test 2: Cambio de Estrategia
1. Cambia tu predicción cada vez
2. Comprueba si mejoras tu porcentaje
3. Nota: Cambiar no mejora tus probabilidades (es aleatorio)

### Test 3: Monedas
1. Cuenta cuántas monedas ganas
2. Verifica que el contador en la esquina superior derecha se actualice
3. Gana al menos 3 monedas antes de llegar a la meta

### Test 4: Llegada a la Meta
1. Llega a la posición 15
2. Observa la animación del cofre abriéndose
3. Ve la llave dorada flotando
4. Completa la misión

### Test 5: Persistencia
1. Juega varias rondas
2. Cierra el navegador
3. Vuelve a abrir `index.html`
4. Tu progreso debería estar guardado

---

## 🎨 Detalles Visuales a Verificar

### ✅ Checklist Visual

- [ ] Contador de monedas visible en esquina superior derecha
- [ ] Panel de predicción con borde dorado
- [ ] Input numérico grande y claro
- [ ] Dado gira al hacer clic en "Lanzar dado"
- [ ] Imagen del dado cambia a la carilla correspondiente (dado1-dado6)
- [ ] Mensaje de "CORRECTA" en verde o "INCORRECTA" en rojo
- [ ] Porcentaje de aciertos se actualiza
- [ ] Animación de moneda dorada aparece al acertar
- [ ] Número de monedas aumenta con efecto de pulso
- [ ] Michi se mueve en el sendero
- [ ] Paso actual resalta con color dorado
- [ ] Al llegar a la meta: Cofre cerrado aparece
- [ ] Cofre se abre automáticamente
- [ ] Llave dorada flota sobre el cofre abierto

---

## 🐛 Solución de Problemas

### El dado no cambia de imagen
**Problema:** Las carillas (dado1.png - dado6.png) no existen
**Solución:** Genera las imágenes usando los prompts en `PROMPTS_GRAFICOS.md`

### No aparece el contador de monedas
**Problema:** Error en el HTML o CSS
**Solución:** Verifica que `index.html` y `style.css` estén actualizados

### Las monedas no se guardan
**Problema:** LocalStorage bloqueado
**Solución:** 
- Verifica que el navegador permita localStorage
- Abre el archivo desde un servidor local (no desde `file://`)

### El porcentaje muestra "NaN%"
**Problema:** División por cero
**Solución:** Esto no debería pasar, pero verifica que `dadoLanzamientos > 0`

---

## 📱 Compatibilidad

### Navegadores Soportados:
- ✅ Chrome/Edge (Recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile Chrome/Safari

### Características Requeridas:
- ✅ JavaScript habilitado
- ✅ LocalStorage disponible
- ✅ CSS3 (animaciones y transforms)

---

## 🎓 Para Educadores

### Conceptos que se Enseñan:
1. **Probabilidad básica** (1/6 por número)
2. **Predicción vs Resultado**
3. **Análisis estadístico** (porcentaje de aciertos)
4. **Aleatoriedad** (resultados no predecibles)
5. **Toma de decisiones** bajo incertidumbre

### Preguntas para Discutir:
- ¿Por qué es difícil acertar siempre?
- ¿Qué porcentaje de aciertos esperas tener?
- ¿Cambiar tu estrategia mejora tus resultados?
- ¿Qué significa 16.67% de probabilidad?

---

## 🚀 Próximas Funcionalidades (Ideas)

- [ ] Gráfico de barras mostrando frecuencia de cada número
- [ ] Historial de últimos 10 lanzamientos
- [ ] Modo "racha": Bonificación por varios aciertos seguidos
- [ ] Comparación con probabilidad teórica vs real
- [ ] Sistema de logros por porcentajes alcanzados

---

**¡Diviértete aprendiendo probabilidad con Michi Money!** 🎲🐱✨
