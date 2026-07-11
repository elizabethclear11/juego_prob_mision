/**
 * MISIÓN PROBABILIDAD — Michi Money
 * Lógica del juego · JavaScript puro
 * Sin librerías · Sin conexión a Internet
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════
     CONSTANTES Y ESTADO
     ═══════════════════════════════════════ */
  const CLAVE_GUARDADO = 'mision-probabilidad-michi';
  const MISIONES_ORDEN = ['dado', 'cajas', 'bolsa', 'ruleta'];

  const IMG = {
    moneda: 'img/objetos/moneda-dorada.png',
    piedra: 'img/objetos/piedra-gris.png',
    fichaAzul: 'img/objetos/ficha-azul.png',
    fichaPlata: 'img/objetos/ficha-plata.png',
    llave: 'img/objetos/llave-antigua.png',
    pista: 'img/objetos/pergamino-pista.png',
    cofre: 'img/tesoro/cofre.png',
    cofreAbierto: 'img/tesoro/cofre-abierto.png',
    cajas: {
      azul: 'img/cajas/caja-azul.png',
      bronce: 'img/cajas/caja-bronce.png',
      hierro: 'img/cajas/caja-hierro.png'
    }
  };

  function crearImg(src, alt, clase) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    if (clase) img.className = clase;
    return img;
  }

  const MENSAJES = {
    suerte: [
      '¡Genial!',
      '¡Increíble!',
      '¡Sigue así!',
      '¡Perfecto!'
    ],
    sinMoneda: [
      'Inténtalo otra vez',
      'Sigue buscando',
      'Otra oportunidad',
      '¡No te rindas!'
    ],
    neutral: [
      '¡Interesante!',
      'Continúa explorando',
      '¡Sigue jugando!',
      '¡Adelante!'
    ]
  };

  const estadoDefault = {
    misionesCompletadas: [],
    resultadosCajas: [],
    resultadosBolsa: { azul: 0, roja: 0 },
    resultadosRuleta: [],
    posicionDado: 0,
    dadoLanzamientos: 0,
    dadoAciertos: 0,
    monedasDado: 0,
    ruletaBonusEntregado: false,
    // Estado persistente de Misión 2
    estadoCajas: null
  };

  let estado = cargarEstado();

  /* Estado temporal de misiones activas */
  let dadoMeta = 15;
  let bolsaIntentos = 0;
  let bolsaMinimoGrafico = 8;
  const RULETA_MAX_INTENTOS = 5;
  let cajasAbiertas = 0;
  let cajasMinimo = 3;

  /* ═══════════════════════════════════════
     UTILIDADES
     ═══════════════════════════════════════ */
  function cargarEstado() {
    try {
      const datos = localStorage.getItem(CLAVE_GUARDADO);
      return datos ? { ...estadoDefault, ...JSON.parse(datos) } : { ...estadoDefault };
    } catch {
      return { ...estadoDefault };
    }
  }

  function guardarEstado() {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(estado));
  }

  function mensajeAleatorio(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    const pantalla = document.getElementById('pantalla-' + id);
    if (pantalla) pantalla.classList.add('activa');
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /** Efecto visual de destello dorado al interactuar */
  function destello(elemento) {
    if (!elemento) return;
    elemento.classList.remove('destello-dorado');
    void elemento.offsetWidth;
    elemento.classList.add('destello-dorado');
    setTimeout(() => elemento.classList.remove('destello-dorado'), 600);
  }

  /** Crear partículas al hacer clic (feedback visual) */
  function crearParticulas(x, y, color = 'var(--dorado)') {
    const contenedor = document.createElement('div');
    contenedor.style.position = 'fixed';
    contenedor.style.left = x + 'px';
    contenedor.style.top = y + 'px';
    contenedor.style.pointerEvents = 'none';
    contenedor.style.zIndex = '1000';
    document.body.appendChild(contenedor);

    for (let i = 0; i < 8; i++) {
      const particula = document.createElement('div');
      particula.style.position = 'absolute';
      particula.style.width = '6px';
      particula.style.height = '6px';
      particula.style.background = color;
      particula.style.borderRadius = '50%';
      particula.style.boxShadow = `0 0 8px ${color}`;
      
      const angulo = (Math.PI * 2 * i) / 8;
      const distancia = 40 + Math.random() * 30;
      const dx = Math.cos(angulo) * distancia;
      const dy = Math.sin(angulo) * distancia;
      
      particula.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      });
      
      contenedor.appendChild(particula);
    }

    setTimeout(() => contenedor.remove(), 650);
  }

  /** Sonido de giro de ruleta (Web Audio API, sin archivos externos) */
  function sonidoGiroRuleta(duracionMs) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + duracionMs / 1000);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duracionMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duracionMs / 1000 + 0.05);
      return ctx;
    } catch {
      return null;
    }
  }

  function sonidoAciertoRuleta() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch { /* sin audio */ }
  }

  /** Chispas doradas en pantalla de inicio */
  function crearChispas() {
    const contenedor = document.getElementById('chispas-fondo');
    if (!contenedor || contenedor.childElementCount > 0) return;
    for (let i = 0; i < 24; i++) {
      const chispa = document.createElement('span');
      chispa.className = 'chispa';
      chispa.style.left = Math.random() * 100 + '%';
      chispa.style.top = (20 + Math.random() * 70) + '%';
      chispa.style.animationDelay = (Math.random() * 4) + 's';
      chispa.style.animationDuration = (3 + Math.random() * 3) + 's';
      contenedor.appendChild(chispa);
    }
  }

  function misionCompletada(id) {
    return estado.misionesCompletadas.includes(id);
  }

  function completarMision(id) {
    if (!misionCompletada(id)) {
      estado.misionesCompletadas.push(id);
      guardarEstado();
    }
  }

  function siguienteMisionDisponible() {
    for (const id of MISIONES_ORDEN) {
      if (!misionCompletada(id)) return id;
    }
    return 'tesoro';
  }

  function misionDesbloqueada(id) {
    if (id === 'inicio') return true;
    if (id === 'tesoro') {
      return MISIONES_ORDEN.every(m => misionCompletada(m));
    }
    const indice = MISIONES_ORDEN.indexOf(id);
    if (indice === 0) return true;
    return misionCompletada(MISIONES_ORDEN[indice - 1]);
  }

  /* ═══════════════════════════════════════
     MAPA
     ═══════════════════════════════════════ */
  
  // Posiciones de Michi en el mapa (coordenadas top, left en %)
  // Estas coordenadas coinciden EXACTAMENTE con los iconos en la imagen del mapa
  const POSICIONES_MAPA = {
    inicio: { top: 88, left: 18 },   // Abajo izquierda (Michi)
    dado: { top: 84, left: 52 },     // Dado dorado grande al inicio del camino
    cajas: { top: 65, left: 72 },    // Las 3 cajas a la derecha
    bolsa: { top: 48, left: 38 },    // Bolsa grande con G
    ruleta: { top: 32, left: 75 },   // Ruleta arriba derecha
    tesoro: { top: 15, left: 50 }    // Cofre grande arriba centro
  };

  // Orden de las misiones para determinar el camino
  const ORDEN_CAMINO = ['inicio', 'dado', 'cajas', 'bolsa', 'ruleta', 'tesoro'];

  function obtenerPosicionActual() {
    // Encontrar la última misión completada para saber dónde está Michi
    let ultimaCompletada = 'inicio';
    for (const id of MISIONES_ORDEN) {
      if (misionCompletada(id)) {
        ultimaCompletada = id;
      } else {
        break;
      }
    }
    return ultimaCompletada;
  }

  function actualizarMapa() {
    const puntos = document.querySelectorAll('.punto-mapa[data-id]');
    const michiViajero = document.getElementById('michi-viajero');
    
    let ultimaCompletada = 'inicio';
    
    puntos.forEach(punto => {
      const id = punto.dataset.id;
      const estadoVisual = punto.querySelector('.punto-estado');

      punto.classList.remove('bloqueado', 'completado', 'disponible');

      if (id === 'inicio') {
        punto.classList.add('completado');
        if (estadoVisual) estadoVisual.textContent = '';
        return;
      }

      if (misionCompletada(id)) {
        punto.classList.add('completado');
        if (estadoVisual) estadoVisual.textContent = '';
        ultimaCompletada = id;
      } else if (misionDesbloqueada(id)) {
        punto.classList.add('disponible');
        if (estadoVisual) estadoVisual.textContent = '';
      } else {
        punto.classList.add('bloqueado');
        if (estadoVisual) estadoVisual.textContent = '';
      }
    });

    // Posicionar a Michi en la última misión completada
    if (michiViajero && POSICIONES_MAPA[ultimaCompletada]) {
      const pos = POSICIONES_MAPA[ultimaCompletada];
      michiViajero.style.top = pos.top + '%';
      michiViajero.style.left = pos.left + '%';
    }
  }

  function moverMichiA(destino) {
    const michiViajero = document.getElementById('michi-viajero');
    if (!michiViajero || !POSICIONES_MAPA[destino]) return;

    const pos = POSICIONES_MAPA[destino];
    
    // Agregar clase de animación
    michiViajero.classList.add('viajando');
    
    // Mover a la nueva posición con transformación suave
    michiViajero.style.top = pos.top + '%';
    michiViajero.style.left = pos.left + '%';

    // Remover clase después de la animación
    setTimeout(() => {
      michiViajero.classList.remove('viajando');
    }, 1200);
  }

  function irAMision(id) {
    if (!misionDesbloqueada(id) && id !== 'tesoro') return;

    if (id === 'tesoro') {
      if (MISIONES_ORDEN.every(m => misionCompletada(m))) {
        moverMichiA('tesoro');
        setTimeout(() => iniciarFinal(), 1500);
      }
      return;
    }

    // Mover a Michi visualmente antes de cambiar de pantalla
    moverMichiA(id);
    
    setTimeout(() => {
      mostrarPantalla(id);
      inicializarMision(id);
    }, 1500);
  }

  function inicializarMision(id) {
    switch (id) {
      case 'dado':   initMisionDado(); break;
      case 'cajas':  initMisionCajas(); break;
      case 'bolsa':  initMisionBolsa(); break;
      case 'ruleta': initMisionRuleta(); break;
    }
  }

  /* ═══════════════════════════════════════
     MISIÓN 1: DADO
     ═══════════════════════════════════════ */
  function initMisionDado() {
    const sendero = document.getElementById('sendero-avance');
    const mensaje = document.getElementById('mensaje-dado');
    const btnLanzar = document.getElementById('btn-lanzar-dado');
    const btnContinuar = document.getElementById('btn-dado-continuar');
    const dado = document.getElementById('dado-animado');
    const dadoImg = document.getElementById('dado-img');
    const michi = document.getElementById('michi-camino');
    const prediccionInput = document.getElementById('prediccion-input');
    const prediccionResultado = document.getElementById('prediccion-resultado');
    const resultadoDadoNum = document.getElementById('resultado-dado-num');
    const resultadoVerificacion = document.getElementById('resultado-verificacion');
    const porcentajeAciertos = document.getElementById('porcentaje-aciertos');
    const animacionMoneda = document.getElementById('animacion-moneda');
    const contadorMonedas = document.getElementById('numero-monedas');
    const cofreFinal = document.getElementById('cofre-final');
    const cofreCerrado = document.getElementById('cofre-cerrado');
    const cofreAbiertoLlave = document.getElementById('cofre-abierto-llave');

    let posicion = estado.posicionDado || 0;
    let lanzando = false;
    let totalLanzamientos = estado.dadoLanzamientos || 0;
    let aciertos = estado.dadoAciertos || 0;
    let monedas = estado.monedasDado || 0;

    // Actualizar contador de monedas
    if (contadorMonedas) {
      contadorMonedas.textContent = monedas;
    }

    /* Construir sendero visual con SOLO números */
    sendero.innerHTML = '';
    for (let i = 0; i <= dadoMeta; i++) {
      const paso = document.createElement('div');
      paso.className = 'paso-sendero' + (i === posicion ? ' activo' : '') + (i === dadoMeta ? ' meta' : '');
      // Solo números, excepto en la meta que ponemos un cofre
      paso.textContent = i === dadoMeta ? '🎁' : i;
      paso.dataset.paso = i;
      sendero.appendChild(paso);
    }

    btnContinuar.classList.add('oculto');
    btnLanzar.classList.remove('oculto');
    btnLanzar.disabled = false;
    prediccionResultado.classList.add('oculto');
    cofreFinal.classList.add('oculto');
    animacionMoneda.classList.add('oculto');

    if (posicion >= dadoMeta) {
      mensaje.textContent = '¡Meta alcanzada!';
      btnLanzar.classList.add('oculto');
      cofreFinal.classList.remove('oculto');
      
      // Mostrar cofre abierto con llave después de un momento
      setTimeout(() => {
        cofreCerrado.classList.add('oculto');
        cofreAbiertoLlave.classList.remove('oculto');
      }, 1000);
      
      btnContinuar.classList.remove('oculto');
      return;
    }

    mensaje.textContent = 'Ingresa tu predicción (1-6) y lanza el dado';

    // Actualizar estadísticas de predicción
    actualizarEstadisticas();

    function actualizarEstadisticas() {
      if (totalLanzamientos > 0) {
        const porcentaje = Math.round((aciertos / totalLanzamientos) * 100);
        porcentajeAciertos.textContent = porcentaje + '%';
      } else {
        porcentajeAciertos.textContent = '0%';
      }
    }

    btnLanzar.onclick = async () => {
      if (lanzando || posicion >= dadoMeta) return;

      // Validar predicción
      const prediccion = parseInt(prediccionInput.value);
      if (!prediccion || prediccion < 1 || prediccion > 6) {
        mensaje.textContent = '⚠️ Ingresa un número del 1 al 6 primero';
        prediccionInput.focus();
        return;
      }

      lanzando = true;
      btnLanzar.disabled = true;
      prediccionResultado.classList.add('oculto');
      animacionMoneda.classList.add('oculto');

      // Efecto de partículas al lanzar
      const rect = dado.getBoundingClientRect();
      crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado-brillo)');

      /* Animación de giro */
      dado.classList.add('girando');

      await sleep(900);

      const resultado = Math.floor(Math.random() * 6) + 1;
      
      // Cambiar la imagen del dado a la carilla correspondiente
      dadoImg.src = `img/dados/dado${resultado}.png`;
      
      dado.classList.remove('girando');
      destello(dado);

      // Verificar predicción
      totalLanzamientos++;
      const predictionCorrecta = (prediccion === resultado);
      if (predictionCorrecta) {
        aciertos++;
        monedas++;
        
        // Animación de moneda ganada
        animacionMoneda.classList.remove('oculto');
        setTimeout(() => {
          animacionMoneda.classList.add('oculto');
        }, 2000);
        
        // Actualizar contador de monedas con animación
        if (contadorMonedas) {
          contadorMonedas.textContent = monedas;
          contadorMonedas.parentElement.style.animation = 'none';
          void contadorMonedas.parentElement.offsetWidth;
          contadorMonedas.parentElement.style.animation = 'pulsoBoton 0.5s ease';
        }
      }

      // Guardar estadísticas
      estado.dadoLanzamientos = totalLanzamientos;
      estado.dadoAciertos = aciertos;
      estado.monedasDado = monedas;

      // Mostrar resultado de predicción
      prediccionResultado.classList.remove('oculto');
      resultadoDadoNum.textContent = resultado;
      
      resultadoVerificacion.textContent = predictionCorrecta 
        ? '✓ Tu predicción fue CORRECTA' 
        : '✗ Tu predicción fue INCORRECTA';
      
      resultadoVerificacion.className = 'resultado-verificacion ' + (predictionCorrecta ? 'correcto' : 'incorrecto');
      
      actualizarEstadisticas();

      const nuevaPos = Math.min(posicion + resultado, dadoMeta);
      const pasosReales = nuevaPos - posicion;
      posicion = nuevaPos;
      estado.posicionDado = posicion;
      guardarEstado();

      /* Mover Michi visualmente */
      if (michi) {
        michi.style.transform = `translateX(${Math.min(posicion * 8, 80)}px)`;
      }

      /* Actualizar sendero */
      sendero.querySelectorAll('.paso-sendero').forEach(p => {
        p.classList.remove('activo');
        if (parseInt(p.dataset.paso, 10) === posicion) {
          p.classList.add('activo');
        }
      });

      mensaje.textContent = predictionCorrecta
        ? `¡Acertaste! Salió ${resultado}. +${pasosReales} pasos ${mensajeAleatorio(MENSAJES.suerte)}`
        : `Salió ${resultado}. +${pasosReales} pasos ${mensajeAleatorio(MENSAJES.neutral)}`;

      if (posicion >= dadoMeta) {
        await sleep(800);
        mensaje.textContent = '¡Meta alcanzada! Michi encontró el cofre con la llave dorada.';
        completarMision('dado');
        btnLanzar.classList.add('oculto');
        
        // Mostrar cofre
        cofreFinal.classList.remove('oculto');
        
        // Animar apertura del cofre después de 1 segundo
        setTimeout(() => {
          cofreCerrado.classList.add('oculto');
          cofreAbiertoLlave.classList.remove('oculto');
          
          // Efecto de partículas al abrir cofre
          const cofreRect = cofreFinal.getBoundingClientRect();
          crearParticulas(cofreRect.left + cofreRect.width / 2, cofreRect.top + cofreRect.height / 2, 'var(--dorado-brillo)');
        }, 1500);
        
        setTimeout(() => {
          btnContinuar.classList.remove('oculto');
        }, 3000);
      } else {
        // Limpiar input para siguiente predicción
        prediccionInput.value = '';
        prediccionInput.focus();
        btnLanzar.disabled = false;
      }

      lanzando = false;
    };

    // También permitir lanzar con Enter
    prediccionInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !lanzando) {
        btnLanzar.click();
      }
    });
  }

  /* ═══════════════════════════════════════
     MISIÓN 2: CAJAS
     ═══════════════════════════════════════ */

  /**
   * Estado por caja:
   *   estado: 'pendiente' | 'en-progreso' | 'en-repeticion' | 'completada'
   *   oportunidadActual: índice 0-2 de la ronda inicial
   *   predicciones[i]: { prediccion, resultado, acerto, isInitialAttempt, hasAwardedPoints }
   *   completedPredictions: cuántas oportunidades ya se acertaron
   *   pendingRetries: índices que fallaron en ronda inicial
   *   retryIndex: posición dentro de pendingRetries
   */
  function crearEstadoCajaDefault(id) {
    return {
      id,
      estado: 'pendiente',
      oportunidadActual: 0,
      predicciones: [],
      completedPredictions: 0,
      pendingRetries: [],
      retryIndex: 0
    };
  }

  function crearEstadoCajasDefault() {
    return {
      cajas: [
        crearEstadoCajaDefault('azul'),
        crearEstadoCajaDefault('bronce'),
        crearEstadoCajaDefault('hierro')
      ],
      cajaActivaIdx: 0,
      misionCompleta: false,
      llaveEntregada: false
    };
  }

  function initMisionCajas() {
    /* ── Referencias DOM ─────────────────────────────────────── */
    const panelActivo     = document.getElementById('cajas-panel-activo');
    const cajaActualEl    = document.getElementById('cajas-caja-actual');
    const oportunidadEl   = document.getElementById('cajas-oportunidad');
    const slotsEl         = document.getElementById('cajas-slots');
    const opcionMoneda    = document.getElementById('cajas-opcion-moneda');
    const opcionPiedra    = document.getElementById('cajas-opcion-piedra');
    const avisoRepeticion = document.getElementById('cajas-aviso-repeticion');
    const resultadoReveal = document.getElementById('cajas-resultado-reveal');
    const resultadoImg    = document.getElementById('cajas-resultado-img');
    const resultadoTexto  = document.getElementById('cajas-resultado-texto');
    const btnAbrir        = document.getElementById('btn-abrir-caja');
    const contenedor      = document.getElementById('cajas-contenedor');
    const mensaje         = document.getElementById('mensaje-cajas');
    const btnContinuar    = document.getElementById('btn-cajas-continuar');
    const llaveEl         = document.getElementById('cajas-llave-final');
    const animMoneda      = document.getElementById('animacion-moneda-cajas');
    const cntMonedas      = document.getElementById('numero-monedas-cajas');
    const btnInfoProb     = document.getElementById('btn-info-prob');
    const probTexto       = document.getElementById('cajas-prob-texto');

    const NOMBRES = { azul: 'Caja Azul', bronce: 'Caja Bronce', hierro: 'Caja Hierro' };
    const IMGS_CAJA = { azul: IMG.cajas.azul, bronce: IMG.cajas.bronce, hierro: IMG.cajas.hierro };

    /* ── Inicializar estado persistente ─────────────────────── */
    if (!estado.estadoCajas) {
      estado.estadoCajas = crearEstadoCajasDefault();
    }
    const sc = estado.estadoCajas;

    let prediccionSeleccionada = null;
    let abriendo = false;

    /* ── Sincronizar contador de monedas ────────────────────── */
    function sincronizarContador() {
      if (cntMonedas) cntMonedas.textContent = estado.monedasDado;
    }
    sincronizarContador();

    /* ── Toggle explicación probabilidad ────────────────────── */
    if (btnInfoProb) {
      // Eliminar listener previo reasignando
      btnInfoProb.onclick = () => probTexto.classList.toggle('oculto');
    }

    /* ── Actualizar visual de las tres cajas ────────────────── */
    function actualizarVisualesCajas() {
      contenedor.querySelectorAll('.caja-item').forEach(cajaEl => {
        const id = cajaEl.dataset.caja;
        const cajaSt = sc.cajas.find(c => c.id === id);
        const cuerpo = cajaEl.querySelector('.caja-cuerpo');

        cajaEl.classList.remove('activa', 'caja-completada', 'caja-en-progreso', 'caja-en-repeticion', 'abierta');

        if (!cajaSt) return;

        if (cajaSt.estado === 'completada') {
          cajaEl.classList.add('caja-completada');
          cuerpo.innerHTML = '';
          cuerpo.appendChild(crearImg(IMGS_CAJA[id], NOMBRES[id], 'caja-img'));
          const check = document.createElement('div');
          check.className = 'caja-check';
          check.textContent = '✓';
          cuerpo.appendChild(check);
        } else {
          cuerpo.innerHTML = '';
          cuerpo.appendChild(crearImg(IMGS_CAJA[id], NOMBRES[id], 'caja-img'));
          if (cajaSt.estado === 'en-progreso') cajaEl.classList.add('caja-en-progreso');
          if (cajaSt.estado === 'en-repeticion') cajaEl.classList.add('caja-en-repeticion');
        }

        const progresoEl = document.getElementById('progreso-' + id);
        if (progresoEl) {
          progresoEl.textContent = cajaSt.completedPredictions + ' de 3 completadas';
        }
      });
    }

    /* ── Actualizar slots de la caja activa ─────────────────── */
    function actualizarSlots(cajaSt) {
      slotsEl.querySelectorAll('.caja-slot').forEach((slot, i) => {
        slot.className = 'caja-slot';
        slot.innerHTML = '';
        const pred = cajaSt.predicciones[i];
        if (!pred) return;
        if (pred.acerto) {
          slot.classList.add('slot-acierto');
          slot.appendChild(crearImg(pred.resultado === 'moneda' ? IMG.moneda : IMG.piedra, pred.resultado));
        } else if (pred.resultado !== undefined) {
          slot.classList.add('slot-fallo');
          slot.appendChild(crearImg(pred.resultado === 'moneda' ? IMG.moneda : IMG.piedra, pred.resultado));
        } else {
          slot.classList.add('slot-vacio');
        }
      });
    }

    /* ── Renderizar panel activo ────────────────────────────── */
    function renderPanelActivo() {
      if (sc.misionCompleta) {
        panelActivo.classList.add('oculto');
        return;
      }
      panelActivo.classList.remove('oculto');

      const cajaSt = sc.cajas[sc.cajaActivaIdx];
      cajaActualEl.textContent = NOMBRES[cajaSt.id];

      const esRepeticion = cajaSt.estado === 'en-repeticion';
      avisoRepeticion.classList.toggle('oculto', !esRepeticion);

      if (esRepeticion) {
        oportunidadEl.textContent =
          `Repetición ${cajaSt.retryIndex + 1} de ${cajaSt.pendingRetries.length}`;
      } else {
        oportunidadEl.textContent = `Oportunidad ${cajaSt.oportunidadActual + 1} de 3`;
      }

      actualizarSlots(cajaSt);

      resultadoReveal.classList.add('oculto');
      resultadoImg.innerHTML = '';
      resultadoTexto.textContent = '';

      prediccionSeleccionada = null;
      opcionMoneda.classList.remove('seleccionada');
      opcionPiedra.classList.remove('seleccionada');
      opcionMoneda.disabled = false;
      opcionPiedra.disabled = false;
      btnAbrir.disabled = true;

      contenedor.querySelectorAll('.caja-item').forEach(el => {
        el.classList.toggle('activa', el.dataset.caja === cajaSt.id);
      });

      mensaje.textContent = 'Escoge qué objeto crees que saldrá de la caja.';
    }

    /* ── Selección de predicción ────────────────────────────── */
    [opcionMoneda, opcionPiedra].forEach(btn => {
      btn.onclick = () => {
        if (abriendo) return;
        if (!resultadoReveal.classList.contains('oculto')) return;
        prediccionSeleccionada = btn.dataset.opcion;
        opcionMoneda.classList.toggle('seleccionada', btn === opcionMoneda);
        opcionPiedra.classList.toggle('seleccionada', btn === opcionPiedra);
        btnAbrir.disabled = false;
      };
    });

    /* ── Abrir caja ─────────────────────────────────────────── */
    btnAbrir.onclick = async () => {
      if (abriendo || !prediccionSeleccionada || sc.misionCompleta) return;

      const cajaSt = sc.cajas[sc.cajaActivaIdx];
      if (cajaSt.estado === 'completada') return;

      abriendo = true;
      btnAbrir.disabled = true;
      opcionMoneda.disabled = true;
      opcionPiedra.disabled = true;

      const esRepeticion = cajaSt.estado === 'en-repeticion';

      /* Generar resultado 50/50 — una sola vez por intento */
      const hayMoneda = Math.random() < 0.5;
      const resultado = hayMoneda ? 'moneda' : 'piedra';
      const acerto = (prediccionSeleccionada === resultado);

      /* Animación de apertura */
      const cajaEl = contenedor.querySelector(`.caja-item[data-caja="${cajaSt.id}"]`);
      if (cajaEl) {
        const rect = cajaEl.getBoundingClientRect();
        crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado)');
        cajaEl.classList.add('abierta');
      }
      await sleep(500);

      /* ── Ronda inicial ─────────────────────────────────────── */
      if (!esRepeticion) {
        const idxOp = cajaSt.oportunidadActual;
        cajaSt.predicciones[idxOp] = {
          prediccion: prediccionSeleccionada,
          resultado,
          acerto,
          isInitialAttempt: true,
          hasAwardedPoints: false
        };

        if (acerto) {
          cajaSt.predicciones[idxOp].hasAwardedPoints = true;
          cajaSt.completedPredictions++;
          estado.monedasDado++;
          sincronizarContador();
          animMoneda.classList.remove('oculto');
          setTimeout(() => animMoneda.classList.add('oculto'), 2000);
          if (cntMonedas) {
            cntMonedas.parentElement.style.animation = 'none';
            void cntMonedas.parentElement.offsetWidth;
            cntMonedas.parentElement.style.animation = 'pulsoBoton 0.5s ease';
          }
        } else {
          cajaSt.pendingRetries.push(idxOp);
        }

        cajaSt.oportunidadActual++;

        if (cajaSt.oportunidadActual >= 3) {
          cajaSt.estado = cajaSt.pendingRetries.length > 0 ? 'en-repeticion' : 'completada';
        } else {
          cajaSt.estado = 'en-progreso';
        }

      /* ── Fase repetición (no suma puntos) ───────────────────── */
      } else {
        if (acerto) {
          cajaSt.completedPredictions++;
          cajaSt.retryIndex++;
          if (cajaSt.retryIndex >= cajaSt.pendingRetries.length) {
            cajaSt.estado = 'completada';
          }
        }
        /* Si falla, retryIndex no avanza → repite el mismo */
      }

      guardarEstado();
      actualizarVisualesCajas();
      actualizarSlots(cajaSt);

      /* Revelar resultado */
      resultadoReveal.classList.remove('oculto');
      resultadoImg.innerHTML = '';
      resultadoImg.appendChild(crearImg(
        hayMoneda ? IMG.moneda : IMG.piedra,
        hayMoneda ? 'Moneda dorada' : 'Piedra gris',
        'objeto-resultado'
      ));
      destello(resultadoReveal);

      if (acerto) {
        resultadoTexto.textContent = '¡Felicidades! Predijiste correctamente el resultado.';
        resultadoTexto.className = 'cajas-resultado-texto correcto';
      } else {
        resultadoTexto.textContent = 'Esta vez no acertaste. Tendrás que volver a intentarlo.';
        resultadoTexto.className = 'cajas-resultado-texto incorrecto';
      }

      await sleep(1400);

      if (cajaEl) cajaEl.classList.remove('abierta');

      /* ── ¿Caja completada? ──────────────────────────────────── */
      if (cajaSt.estado === 'completada') {
        mensaje.textContent = `¡${NOMBRES[cajaSt.id]} completada!`;

        const todasCompletas = sc.cajas.every(c => c.estado === 'completada');
        if (todasCompletas && !sc.misionCompleta) {
          sc.misionCompleta = true;
          sc.llaveEntregada = true;
          guardarEstado();
          completarMision('cajas');
          await sleep(600);
          mostrarLlaveFinal();
          abriendo = false;
          return;
        }

        /* Avanzar a la siguiente caja incompleta */
        const siguienteIdx = sc.cajas.findIndex(
          (c, i) => i > sc.cajaActivaIdx && c.estado !== 'completada'
        );
        if (siguienteIdx !== -1) {
          sc.cajaActivaIdx = siguienteIdx;
          if (sc.cajas[siguienteIdx].estado === 'pendiente') {
            sc.cajas[siguienteIdx].estado = 'en-progreso';
          }
          guardarEstado();
          await sleep(400);
        }
      }

      abriendo = false;
      opcionMoneda.disabled = false;
      opcionPiedra.disabled = false;
      renderPanelActivo();
    };

    /* ── Llave final ────────────────────────────────────────── */
    function mostrarLlaveFinal() {
      panelActivo.classList.add('oculto');
      mensaje.textContent = '¡Misión completada! Ganaste la llave para abrir el siguiente nivel.';
      llaveEl.classList.remove('oculto');
      const rect = llaveEl.getBoundingClientRect();
      crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado-brillo)');
      setTimeout(() => btnContinuar.classList.remove('oculto'), 2000);
    }

    /* ── Restaurar si misión ya estaba completada ───────────── */
    if (sc.misionCompleta) {
      actualizarVisualesCajas();
      panelActivo.classList.add('oculto');
      llaveEl.classList.remove('oculto');
      mensaje.textContent = '¡Misión completada! Ganaste la llave para abrir el siguiente nivel.';
      btnContinuar.classList.remove('oculto');
      return;
    }

    /* ── Asegurar estado inicial de la caja activa ──────────── */
    const cajaSt = sc.cajas[sc.cajaActivaIdx];
    if (cajaSt.estado === 'pendiente') cajaSt.estado = 'en-progreso';

    /* ── Render inicial ─────────────────────────────────────── */
    actualizarVisualesCajas();
    renderPanelActivo();
  }

  /* ═══════════════════════════════════════
     MISIÓN 3: BOLSA
     ═══════════════════════════════════════ */
  function initMisionBolsa() {
    const bolsa = document.getElementById('bolsa-clic');
    const ficha = document.getElementById('ficha-saliente');
    const mensaje = document.getElementById('mensaje-bolsa');
    const contador = document.getElementById('contador-bolsa');
    const grafico = document.getElementById('grafico-bolsa');
    const btnContinuar = document.getElementById('btn-bolsa-continuar');
    const barraAzul = document.getElementById('barra-azul');
    const barraRoja = document.getElementById('barra-roja');
    const numAzul = document.getElementById('num-azul');
    const numRoja = document.getElementById('num-roja');

    bolsaIntentos = estado.resultadosBolsa.azul + estado.resultadosBolsa.roja;
    grafico.classList.add('oculto');
    btnContinuar.classList.add('oculto');
    ficha.innerHTML = '';
    contador.textContent = `Intentos: ${bolsaIntentos}`;

    let ocupado = false;

    /* Probabilidad: 55% azul, 45% roja (bolsa con más fichas azules) */
    const PROB_AZUL = 0.55;

    bolsa.onclick = async () => {
      if (ocupado) return;
      ocupado = true;

      // Efecto de partículas al tocar la bolsa
      const rect = bolsa.getBoundingClientRect();
      crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado-claro)');

      bolsa.classList.add('sacudiendo');
      await sleep(400);
      bolsa.classList.remove('sacudiendo');

      const esAzul = Math.random() < PROB_AZUL;
      const color = esAzul ? 'azul' : 'roja';
      estado.resultadosBolsa[color]++;
      bolsaIntentos++;
      guardarEstado();

      const srcFicha = esAzul ? IMG.fichaAzul : IMG.fichaPlata;
      const altFicha = esAzul ? 'Ficha azul' : 'Ficha plata';

      ficha.innerHTML = '';
      ficha.appendChild(crearImg(srcFicha, altFicha));
      ficha.classList.remove('aparece');
      void ficha.offsetWidth;
      ficha.classList.add('aparece');
      destello(bolsa);
      destello(ficha);

      contador.textContent = `Intentos: ${bolsaIntentos}`;
      mensaje.textContent = esAzul
        ? 'Ficha azul! ' + mensajeAleatorio(MENSAJES.neutral)
        : 'Ficha plata! ' + mensajeAleatorio(MENSAJES.neutral);

      if (bolsaIntentos >= bolsaMinimoGrafico) {
        mostrarGraficoBolsa();
        if (!misionCompletada('bolsa')) {
          completarMision('bolsa');
          btnContinuar.classList.remove('oculto');
        }
      }

      ocupado = false;
    };

    function mostrarGraficoBolsa() {
      const { azul, roja } = estado.resultadosBolsa;
      const total = azul + roja || 1;
      const pctAzul = Math.round((azul / total) * 100);
      const pctRoja = Math.round((roja / total) * 100);

      grafico.classList.remove('oculto');
      numAzul.textContent = azul;
      numRoja.textContent = roja;
      barraAzul.style.setProperty('--altura', Math.max(pctAzul, 8) + '%');
      barraRoja.style.setProperty('--altura', Math.max(pctRoja, 8) + '%');
    }

    if (bolsaIntentos >= bolsaMinimoGrafico) {
      mostrarGraficoBolsa();
      if (misionCompletada('bolsa')) btnContinuar.classList.remove('oculto');
    }
  }

  /* ═══════════════════════════════════════
     MISIÓN 4: RULETA
     ═══════════════════════════════════════ */
  
  // Configuración de la ruleta
  // IMPORTANTE: Estos ángulos deben coincidir con la imagen real y los objetos del HTML.
  // Convención: 0° = arriba (12 en punto), sentido horario positivo (igual que CSS rotate).
  // La flecha fija apunta al sector en 0°.
  const ANGULO_FLECHA = 0;
  const ANGULO_INICIAL_RULETA = 0;

  const RULETA_CONFIG = {
    sectores: [
      { tipo: 'moneda', angulo: 45, color: '#D4A017' },   // Superior-Derecha (cuadrante azul)
      { tipo: 'llave', angulo: 135, color: '#8D6E63' },   // Inferior-Derecha (cuadrante marrón)
      { tipo: 'pista', angulo: 225, color: '#F0C75E' },   // Inferior-Izquierda (cuadrante oscuro)
      { tipo: 'piedra', angulo: 315, color: '#5D4037' }  // Superior-Izquierda (cuadrante dorado)
    ]
  };

  const GRADOS_POR_SECTOR = 360 / RULETA_CONFIG.sectores.length;
  const RULETA_TOTAL_ESPACIOS = 10;

  const RULETA_PREMIOS = [
    { tipo: 'moneda', label: 'Moneda', espacios: 5, pct: 50, img: IMG.moneda, mensaje: '¡Moneda dorada!' },
    { tipo: 'llave', label: 'Llave', espacios: 2, pct: 20, img: IMG.llave, mensaje: '¡Llave misteriosa!' },
    { tipo: 'piedra', label: 'Piedra', espacios: 2, pct: 20, img: IMG.piedra, mensaje: 'Piedra gris' },
    { tipo: 'pista', label: 'Pista', espacios: 1, pct: 10, img: IMG.pista, mensaje: '¡Pergamino con pista!' }
  ];

  function crearPoolRuleta() {
    const pool = [];
    RULETA_PREMIOS.forEach(p => {
      for (let i = 0; i < p.espacios; i++) pool.push(p);
    });
    return pool;
  }

  function premioRuletaPorTipo(tipo) {
    return RULETA_PREMIOS.find(p => p.tipo === tipo) || RULETA_PREMIOS[0];
  }

  const poolRuleta = crearPoolRuleta();
  let rotacionAcumulada = 0;

  function imgRuletaPorTipo(tipo) {
    const mapa = {
      moneda: IMG.moneda,
      llave: IMG.llave,
      pista: IMG.pista,
      piedra: IMG.piedra
    };
    return mapa[tipo] || IMG.moneda;
  }

  function normalizarAngulo(angulo) {
    return ((angulo % 360) + 360) % 360;
  }

  function obtenerIndiceGanador(tipo) {
    return RULETA_CONFIG.sectores.findIndex(s => s.tipo === tipo);
  }

  function obtenerCentroSector(indice) {
    const sector = RULETA_CONFIG.sectores[indice];
    if (sector && typeof sector.angulo === 'number') {
      return sector.angulo;
    }
    return ANGULO_INICIAL_RULETA + indice * GRADOS_POR_SECTOR + GRADOS_POR_SECTOR / 2;
  }

  function calcularRotacionFinal(rotacionActual, indiceGanador, vueltasCompletas) {
    const centroSector = obtenerCentroSector(indiceGanador);
    const objetivoNormalizado = normalizarAngulo(ANGULO_FLECHA - centroSector);
    const actualNormalizado = normalizarAngulo(rotacionActual);
    let ajuste = objetivoNormalizado - actualNormalizado;
    if (ajuste <= 0) ajuste += 360;
    return rotacionActual + vueltasCompletas * 360 + ajuste;
  }

  function detectarPremioPorRotacion(rotacionFinal) {
    const rotacionNormalizada = normalizarAngulo(rotacionFinal);
    let mejorIndice = 0;
    let menorDistancia = Infinity;

    RULETA_CONFIG.sectores.forEach((sector, indice) => {
      const posicionVisual = normalizarAngulo(sector.angulo + rotacionNormalizada);
      const distancia = Math.min(
        Math.abs(posicionVisual - ANGULO_FLECHA),
        360 - Math.abs(posicionVisual - ANGULO_FLECHA)
      );
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        mejorIndice = indice;
      }
    });

    return {
      indice: mejorIndice,
      tipo: RULETA_CONFIG.sectores[mejorIndice].tipo,
      anguloSector: RULETA_CONFIG.sectores[mejorIndice].angulo
    };
  }

  function initMisionRuleta() {
    const disco = document.getElementById('ruleta-disco');
    const contenedorRuleta = document.getElementById('ruleta-contenedor');
    const flecha = document.getElementById('ruleta-flecha');
    const mensaje = document.getElementById('mensaje-ruleta');
    const btnGirar = document.getElementById('btn-girar-ruleta');
    const btnSiguiente = document.getElementById('btn-ruleta-siguiente');
    const btnContinuar = document.getElementById('btn-ruleta-continuar');
    const contadorIntentos = document.getElementById('ruleta-contador-intentos');
    const michiMensaje = document.getElementById('ruleta-michi-mensaje');
    const panelPrediccion = document.getElementById('ruleta-panel-prediccion');
    const panelProb = document.getElementById('ruleta-prob-panel');
    const opcionesPrediccion = document.getElementById('ruleta-opciones-prediccion');
    const probBarras = document.getElementById('ruleta-prob-barras');
    const espaciosVisual = document.getElementById('ruleta-espacios-visual');
    const panelResultado = document.getElementById('ruleta-resultado-panel');
    const resultadoReal = document.getElementById('ruleta-resultado-real');
    const resultadoPrediccion = document.getElementById('ruleta-resultado-prediccion');
    const comparacion = document.getElementById('ruleta-comparacion');
    const puntosGanados = document.getElementById('ruleta-puntos-ganados');
    const panelResumen = document.getElementById('ruleta-resumen-final');
    const resumenAciertos = document.getElementById('ruleta-resumen-aciertos');
    const resumenResultados = document.getElementById('ruleta-resumen-resultados');
    const resumenBonus = document.getElementById('ruleta-resumen-bonus');
    const premioEspecial = document.getElementById('ruleta-premio-especial');
    const michiCelebracion = document.getElementById('ruleta-michi-celebracion');
    const esperaEl = document.getElementById('ruleta-espera');
    const cntMonedas = document.getElementById('numero-monedas-ruleta');
    const zonaRuleta = document.getElementById('imagenRuleta');

    if (!estado.resultadosRuleta) estado.resultadosRuleta = [];

    let intentosRealizados = estado.resultadosRuleta.length;
    let prediccionSeleccionada = null;
    let girando = false;

    function sincronizarMonedas() {
      if (cntMonedas) cntMonedas.textContent = estado.monedasDado || 0;
    }
    sincronizarMonedas();

    function renderProbabilidades() {
      if (!probBarras || !espaciosVisual) return;
      probBarras.innerHTML = '';
      espaciosVisual.innerHTML = '';

      RULETA_PREMIOS.forEach(p => {
        const fila = document.createElement('div');
        fila.className = 'ruleta-prob-fila';
        fila.innerHTML = `
          <span class="ruleta-prob-etiqueta">
            <img src="${p.img}" alt="${p.label}">
            ${p.label}
          </span>
          <div class="ruleta-prob-barra-fondo">
            <div class="ruleta-prob-barra-relleno ${p.tipo}" style="width: 0%"></div>
          </div>
          <span class="ruleta-prob-pct">${p.pct}%</span>
        `;
        probBarras.appendChild(fila);
        requestAnimationFrame(() => {
          fila.querySelector('.ruleta-prob-barra-relleno').style.width = p.pct + '%';
        });
      });

      const leyenda = document.createElement('p');
      leyenda.className = 'ruleta-prob-ayuda';
      leyenda.style.marginTop = '0';
      leyenda.textContent = `${RULETA_TOTAL_ESPACIOS} espacios en la ruleta:`;
      espaciosVisual.appendChild(leyenda);
      const slots = document.createElement('div');
      slots.style.display = 'flex';
      slots.style.flexWrap = 'wrap';
      slots.style.gap = '4px';
      slots.style.justifyContent = 'center';
      slots.style.width = '100%';
      RULETA_PREMIOS.forEach(p => {
        for (let i = 0; i < p.espacios; i++) {
          const slot = document.createElement('span');
          slot.className = 'ruleta-espacio-slot';
          slot.title = p.label;
          slot.appendChild(crearImg(p.img, p.label));
          slots.appendChild(slot);
        }
      });
      espaciosVisual.appendChild(slots);
    }

    function renderOpcionesPrediccion() {
      if (!opcionesPrediccion) return;
      opcionesPrediccion.innerHTML = '';
      RULETA_PREMIOS.forEach(p => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ruleta-opcion-btn';
        btn.dataset.tipo = p.tipo;
        btn.appendChild(crearImg(p.img, p.label));
        btn.appendChild(document.createTextNode(p.label));
        btn.onclick = () => {
          if (girando || !panelResultado.classList.contains('oculto')) return;
          prediccionSeleccionada = p.tipo;
          opcionesPrediccion.querySelectorAll('.ruleta-opcion-btn').forEach(b => {
            b.classList.toggle('seleccionada', b === btn);
          });
          btnGirar.disabled = false;
          mensaje.textContent = '¡Listo! Presiona Girar cuando quieras.';
        };
        opcionesPrediccion.appendChild(btn);
      });
    }

    function actualizarContador() {
      if (contadorIntentos) {
        contadorIntentos.textContent = `Intentos: ${intentosRealizados}/${RULETA_MAX_INTENTOS}`;
      }
    }

    function resetFasePrediccion() {
      prediccionSeleccionada = null;
      panelResultado.classList.add('oculto');
      panelPrediccion.classList.remove('oculto');
      panelProb.classList.remove('oculto');
      michiMensaje.textContent = 'Antes de girar la ruleta... ¿qué premio crees que aparecerá?';
      btnGirar.classList.remove('oculto');
      btnGirar.disabled = true;
      btnSiguiente.classList.add('oculto');
      opcionesPrediccion.querySelectorAll('.ruleta-opcion-btn').forEach(b => {
        b.classList.remove('seleccionada');
        b.disabled = false;
      });
      actualizarContador();
      mensaje.textContent = intentosRealizados > 0
        ? `Intento ${intentosRealizados + 1} de ${RULETA_MAX_INTENTOS}. Elige tu predicción.`
        : 'Selecciona tu predicción para poder girar.';
    }

    function renderItemResultado(contenedor, premio) {
      contenedor.innerHTML = '';
      contenedor.appendChild(crearImg(premio.img, premio.label));
      const texto = document.createElement('strong');
      texto.textContent = premio.label.toUpperCase();
      contenedor.appendChild(texto);
    }

    function contarAciertos() {
      return estado.resultadosRuleta.filter(r => r.acerto).length;
    }

    function contarResultadosPorTipo() {
      const conteo = { moneda: 0, llave: 0, piedra: 0, pista: 0 };
      estado.resultadosRuleta.forEach(r => {
        if (conteo[r.tipo] !== undefined) conteo[r.tipo]++;
      });
      return conteo;
    }

    function mostrarResumenFinal() {
      panelPrediccion.classList.add('oculto');
      panelProb.classList.add('oculto');
      panelResultado.classList.add('oculto');
      zonaRuleta.classList.add('oculto');
      btnGirar.classList.add('oculto');
      btnSiguiente.classList.add('oculto');
      panelResumen.classList.remove('oculto');
      btnContinuar.classList.remove('oculto');

      const aciertos = contarAciertos();
      resumenAciertos.textContent = `Tus predicciones correctas: ${aciertos}/${RULETA_MAX_INTENTOS}`;

      resumenResultados.innerHTML = '<p style="text-align:center;margin:0 0 0.5rem;font-weight:700;color:var(--dorado-claro)">Resultados obtenidos:</p>';
      const conteo = contarResultadosPorTipo();
      RULETA_PREMIOS.forEach(p => {
        const fila = document.createElement('div');
        fila.className = 'ruleta-resumen-fila';
        fila.appendChild(crearImg(p.img, p.label));
        fila.appendChild(document.createTextNode(`${p.label}: ${conteo[p.tipo]} ${conteo[p.tipo] === 1 ? 'vez' : 'veces'}`));
        resumenResultados.appendChild(fila);
      });

      let bonusTotal = 0;
      let textoBonus = '';
      if (aciertos >= 1) {
        bonusTotal += 10;
        textoBonus = '+10 puntos por tu primer acierto';
      }
      if (aciertos >= 3) {
        bonusTotal += 30;
        textoBonus = '+40 puntos extra por 3 o más aciertos';
      }
      if (bonusTotal > 0 && !estado.ruletaBonusEntregado) {
        estado.monedasDado = (estado.monedasDado || 0) + bonusTotal;
        estado.ruletaBonusEntregado = true;
        guardarEstado();
        sincronizarMonedas();
        resumenBonus.textContent = `Bonificación final: ${textoBonus}`;
        resumenBonus.classList.remove('oculto');
      } else if (bonusTotal > 0 && estado.ruletaBonusEntregado) {
        resumenBonus.textContent = `Bonificación final ya obtenida: ${textoBonus}`;
        resumenBonus.classList.remove('oculto');
      }

      if (aciertos >= RULETA_MAX_INTENTOS) {
        premioEspecial.classList.remove('oculto');
        michiCelebracion.classList.remove('oculto');
      }

      mensaje.textContent = '¡Desafío final superado! El tesoro te espera.';
      michiMensaje.textContent = '¡Increíble! Aprendiste que la probabilidad guía nuestras expectativas, pero el azar siempre sorprende.';
    }

    /* Inicializar UI estática */
    renderProbabilidades();
    renderOpcionesPrediccion();

    rotacionAcumulada = 0;
    disco.style.transition = 'none';
    disco.style.transform = 'rotate(0deg)';
    void disco.offsetWidth;

    btnContinuar.classList.add('oculto');
    panelResumen.classList.add('oculto');
    premioEspecial.classList.add('oculto');
    michiCelebracion.classList.add('oculto');
    resumenBonus.classList.add('oculto');
    zonaRuleta.classList.remove('oculto');

    if (intentosRealizados >= RULETA_MAX_INTENTOS) {
      if (!misionCompletada('ruleta')) completarMision('ruleta');
      mostrarResumenFinal();
      return;
    }

    resetFasePrediccion();

    btnGirar.onclick = async () => {
      if (girando || !prediccionSeleccionada) return;
      if (intentosRealizados >= RULETA_MAX_INTENTOS) return;

      girando = true;
      btnGirar.disabled = true;
      opcionesPrediccion.querySelectorAll('.ruleta-opcion-btn').forEach(b => { b.disabled = true; });
      panelResultado.classList.add('oculto');
      puntosGanados.classList.add('oculto');

      const intentoNum = intentosRealizados + 1;
      mensaje.textContent = `Intento ${intentoNum}/${RULETA_MAX_INTENTOS} — ¡La ruleta gira!`;
      michiMensaje.textContent = '¡Veamos si tu predicción coincide con el azar!';

      const rect = disco.getBoundingClientRect();
      crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado)');

      /* Premio seleccionado UNA SOLA VEZ antes del giro */
      const resultadoPremio = poolRuleta[Math.floor(Math.random() * poolRuleta.length)];
      const premioSeleccionado = resultadoPremio.tipo;
      const INDICE_GANADOR = obtenerIndiceGanador(premioSeleccionado);
      if (INDICE_GANADOR < 0) {
        girando = false;
        resetFasePrediccion();
        return;
      }

      const vueltasCompletas = 5 + Math.floor(Math.random() * 4);
      const ROTACION_FINAL = calcularRotacionFinal(rotacionAcumulada, INDICE_GANADOR, vueltasCompletas);

      /* Efectos durante el giro */
      flecha.classList.add('vibrando');
      contenedorRuleta.classList.add('girando-intenso');
      esperaEl.classList.remove('oculto');
      sonidoGiroRuleta(4200);

      disco.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      disco.style.transform = `rotate(${ROTACION_FINAL}deg)`;
      rotacionAcumulada = ROTACION_FINAL;

      await sleep(4200);

      flecha.classList.remove('vibrando');
      contenedorRuleta.classList.remove('girando-intenso');
      esperaEl.classList.add('oculto');

      /* Suspense antes del resultado */
      await sleep(600);
      contenedorRuleta.classList.add('celebracion');
      destello(disco);
      crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado-brillo)');
      await sleep(400);
      contenedorRuleta.classList.remove('celebracion');

      const acerto = prediccionSeleccionada === premioSeleccionado;
      const predPremio = premioRuletaPorTipo(prediccionSeleccionada);

      estado.resultadosRuleta.push({
        tipo: premioSeleccionado,
        prediccion: prediccionSeleccionada,
        acerto,
        img: resultadoPremio.img
      });
      intentosRealizados++;
      guardarEstado();

      /* Mostrar comparación */
      panelPrediccion.classList.add('oculto');
      panelResultado.classList.remove('oculto');
      renderItemResultado(resultadoReal, resultadoPremio);
      renderItemResultado(resultadoPrediccion, predPremio);

      if (acerto) {
        comparacion.textContent = '¡Correcto! Tu predicción coincidió con el resultado.';
        comparacion.className = 'ruleta-comparacion correcto';
        puntosGanados.textContent = '+1 punto';
        puntosGanados.classList.remove('oculto');
        estado.monedasDado = (estado.monedasDado || 0) + 1;
        guardarEstado();
        sincronizarMonedas();
        sonidoAciertoRuleta();
        michiMensaje.textContent = '¡Lo adivinaste! Aunque la probabilidad ayuda, a veces el azar te sonríe.';
      } else {
        comparacion.textContent = 'Esta vez no acertaste, pero recuerda que la probabilidad no significa que siempre ocurrirá. ¡Inténtalo nuevamente!';
        comparacion.className = 'ruleta-comparacion incorrecto';
        michiMensaje.textContent = 'No te preocupes. Aunque un objeto tenga más probabilidad, no siempre saldrá. ¡Sigue intentando!';
      }

      mensaje.textContent = acerto
        ? `¡Acierto en el intento ${intentoNum}! Observa las probabilidades para el siguiente giro.`
        : `Intento ${intentoNum} completado. Observa qué objeto tiene más espacios en la ruleta.`;

      btnGirar.classList.add('oculto');

      if (intentosRealizados >= RULETA_MAX_INTENTOS) {
        completarMision('ruleta');
        await sleep(1200);
        mostrarResumenFinal();
      } else {
        btnSiguiente.classList.remove('oculto');
      }

      girando = false;
    };

    btnSiguiente.onclick = () => {
      btnSiguiente.classList.add('oculto');
      resetFasePrediccion();
    };
  }

  /* ═══════════════════════════════════════
     PANTALLA FINAL
     ═══════════════════════════════════════ */
  function iniciarFinal() {
    mostrarPantalla('tesoro');

    const cofre = document.getElementById('cofre-contenedor');
    const imgCofre = document.getElementById('img-cofre');
    const celebracion = document.getElementById('celebracion-michi');
    const mensajeFinal = document.getElementById('mensaje-final');
    const confeti = document.getElementById('confeti-contenedor');
    const monedas = document.getElementById('monedas-caida');

    cofre.classList.remove('abierto');
    if (imgCofre) imgCofre.src = IMG.cofre;
    if (celebracion) celebracion.classList.add('oculto');
    mensajeFinal.classList.add('oculto');
    confeti.innerHTML = '';
    monedas.innerHTML = '';

    setTimeout(() => {
      cofre.classList.add('abierto');
      if (imgCofre) imgCofre.src = IMG.cofreAbierto;
      crearConfeti(confeti);
      crearMonedas(monedas);
    }, 500);

    setTimeout(() => {
      if (celebracion) celebracion.classList.remove('oculto');
      mensajeFinal.classList.remove('oculto');
    }, 2200);
  }

  function crearConfeti(contenedor) {
    const colores = ['#D4A017', '#F0C75E', '#3D6A9E', '#F5F7FA', '#8D6E63', '#4A5568', '#1E3A5F'];
    for (let i = 0; i < 60; i++) {
      const pieza = document.createElement('div');
      pieza.className = 'pieza-confeti';
      pieza.style.left = Math.random() * 100 + '%';
      pieza.style.background = colores[Math.floor(Math.random() * colores.length)];
      pieza.style.animationDuration = (2 + Math.random() * 3) + 's';
      pieza.style.animationDelay = Math.random() * 2 + 's';
      pieza.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      pieza.style.width = (6 + Math.random() * 8) + 'px';
      pieza.style.height = (6 + Math.random() * 8) + 'px';
      contenedor.appendChild(pieza);
    }
  }

  function crearMonedas(contenedor) {
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const moneda = document.createElement('span');
        moneda.className = 'moneda-cayendo';
        moneda.appendChild(crearImg(IMG.moneda, 'Moneda'));
        moneda.style.left = (20 + Math.random() * 60) + '%';
        moneda.style.animationDelay = (Math.random() * 0.3) + 's';
        contenedor.appendChild(moneda);
      }, i * 120);
    }
  }

  function reiniciarJuego() {
    estado = { ...estadoDefault };
    estado.estadoCajas = null;
    guardarEstado();
    estado.posicionDado = 0;
    actualizarMapa();
    mostrarPantalla('inicio');
    actualizarIndicadorPartida();
  }

  /* ═══════════════════════════════════════
     EVENTOS DE NAVEGACIÓN
     ═══════════════════════════════════════ */
  
  /* Verificar si hay partida guardada y actualizar UI */
  function actualizarIndicadorPartida() {
    const btnComenzar = document.getElementById('btn-comenzar');
    const badgeGuardado = document.getElementById('badge-guardado');
    
    const hayPartida = estado.misionesCompletadas.length > 0 || 
                       estado.posicionDado > 0 ||
                       estado.dadoLanzamientos > 0 ||
                       estado.monedasDado > 0;
    
    if (hayPartida && badgeGuardado) {
      badgeGuardado.classList.remove('oculto');
      btnComenzar.innerHTML = 'Continuar aventura<span class="badge-guardado" id="badge-guardado">Partida guardada</span>';
    } else if (badgeGuardado) {
      badgeGuardado.classList.add('oculto');
      btnComenzar.innerHTML = 'Comenzar aventura';
    }
  }
  
  function initEventos() {
    /* Inicio */
    document.getElementById('btn-comenzar').addEventListener('click', () => {
      mostrarPantalla('historia');
    });

    /* Botón de reiniciar en el inicio */
    const modalReiniciar = document.getElementById('modal-reiniciar');
    document.getElementById('btn-reiniciar-inicio').addEventListener('click', () => {
      modalReiniciar.showModal();
    });

    document.getElementById('btn-confirmar-reinicio').addEventListener('click', () => {
      reiniciarJuego();
      modalReiniciar.close();
      // Efecto visual
      const chispas = document.getElementById('chispas-fondo');
      if (chispas) {
        chispas.innerHTML = '';
        crearChispas();
      }
    });

    document.getElementById('btn-cancelar-reinicio').addEventListener('click', () => {
      modalReiniciar.close();
    });

    const modal = document.getElementById('modal-instrucciones');
    document.getElementById('btn-instrucciones').addEventListener('click', () => {
      modal.showModal();
    });
    document.getElementById('btn-cerrar-instrucciones').addEventListener('click', () => {
      modal.close();
    });

    /* Historia */
    document.getElementById('btn-comenzar-mision').addEventListener('click', () => {
      actualizarMapa();
      mostrarPantalla('mapa');
    });

    /* Mapa */
    document.getElementById('btn-mapa-inicio').addEventListener('click', () => {
      mostrarPantalla('inicio');
    });

    document.querySelectorAll('.punto-mapa[data-id]').forEach(punto => {
      punto.addEventListener('click', (e) => {
        const id = punto.dataset.id;
        if (id === 'inicio') return;
        if (punto.classList.contains('bloqueado')) {
          // Feedback visual cuando intentan acceder a una misión bloqueada
          punto.style.animation = 'none';
          setTimeout(() => {
            punto.style.animation = 'sacudirBloqueado 0.5s ease';
          }, 10);
          return;
        }
        
        // Efecto de partículas al hacer clic en un punto
        const rect = punto.getBoundingClientRect();
        crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado)');
        
        irAMision(id);
      });
    });

    /* Volver al mapa desde misiones */
    document.getElementById('btn-dado-mapa').addEventListener('click', () => {
      actualizarMapa();
      mostrarPantalla('mapa');
    });
    document.getElementById('btn-cajas-mapa').addEventListener('click', () => {
      actualizarMapa();
      mostrarPantalla('mapa');
    });
    document.getElementById('btn-bolsa-mapa').addEventListener('click', () => {
      actualizarMapa();
      mostrarPantalla('mapa');
    });
    document.getElementById('btn-ruleta-mapa').addEventListener('click', () => {
      actualizarMapa();
      mostrarPantalla('mapa');
    });

    /* Continuar después de misiones */
    document.getElementById('btn-dado-continuar').addEventListener('click', () => {
      actualizarMapa();
      mostrarPantalla('mapa');
    });
    document.getElementById('btn-cajas-continuar').addEventListener('click', () => {
      actualizarMapa();
      mostrarPantalla('mapa');
    });
    document.getElementById('btn-bolsa-continuar').addEventListener('click', () => {
      actualizarMapa();
      mostrarPantalla('mapa');
    });
    document.getElementById('btn-ruleta-continuar').addEventListener('click', () => {
      iniciarFinal();
    });

    /* Dado: también se puede lanzar tocando la imagen */
    const dadoBtn = document.getElementById('dado-animado');
    const btnLanzarGlobal = document.getElementById('btn-lanzar-dado');
    if (dadoBtn && btnLanzarGlobal) {
      dadoBtn.addEventListener('click', () => btnLanzarGlobal.click());
    }

    /* Final */
    document.getElementById('btn-reiniciar').addEventListener('click', reiniciarJuego);
    document.getElementById('btn-final-inicio').addEventListener('click', () => {
      mostrarPantalla('inicio');
    });
  }

  /* ═══════════════════════════════════════
     INICIO
     ═══════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    initEventos();
    crearChispas();
    actualizarMapa();
    actualizarIndicadorPartida();

    /* Si ya completó todo, permitir ir al tesoro desde el mapa */
    if (MISIONES_ORDEN.every(m => misionCompletada(m))) {
      const puntoTesoro = document.querySelector('.punto-mapa[data-id="tesoro"]');
      if (puntoTesoro) {
        puntoTesoro.classList.remove('bloqueado');
        puntoTesoro.classList.add('disponible');
      }
    }
  });

})();
