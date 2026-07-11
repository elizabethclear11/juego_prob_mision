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
    // Estado persistente de Misión 2
    estadoCajas: null
  };

  let estado = cargarEstado();

  /* Estado temporal de misiones activas */
  let dadoMeta = 15;
  let bolsaIntentos = 0;
  let bolsaMinimoGrafico = 8;
  let ruletaGiros = 0;
  let ruletaMinimo = 5;
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
  // IMPORTANTE: Estos ángulos deben coincidir con la imagen real de la ruleta
  // La flecha apunta hacia ARRIBA (0 grados)
  const RULETA_CONFIG = {
    // Mapeo de tipos de premio a sus ángulos en la imagen
    // Los ángulos representan dónde están los sectores en la imagen de la ruleta
    // 0° = arriba (donde apunta la flecha)
    sectores: [
      { tipo: 'moneda', angulo: 0, color: '#D4A017' },      // Arriba
      { tipo: 'llave', angulo: 45, color: '#8D6E63' },      // Derecha-arriba
      { tipo: 'moneda', angulo: 90, color: '#D4A017' },     // Derecha
      { tipo: 'pista', angulo: 135, color: '#F0C75E' },     // Derecha-abajo
      { tipo: 'moneda', angulo: 180, color: '#D4A017' },    // Abajo
      { tipo: 'piedra', angulo: 225, color: '#5D4037' },    // Izquierda-abajo
      { tipo: 'llave', angulo: 270, color: '#8D6E63' },     // Izquierda
      { tipo: 'pista', angulo: 315, color: '#F0C75E' }      // Izquierda-arriba
    ]
  };

  const RULETA_OPCIONES = [
    { tipo: 'moneda', peso: 40, mensaje: '¡Moneda dorada!', img: IMG.moneda },
    { tipo: 'llave', peso: 25, mensaje: '¡Llave misteriosa!', img: IMG.llave },
    { tipo: 'pista', peso: 20, mensaje: '¡Pergamino con pista!', img: IMG.pista },
    { tipo: 'piedra', peso: 15, mensaje: 'Piedra gris', img: IMG.piedra }
  ];

  function crearPoolRuleta() {
    const pool = [];
    RULETA_OPCIONES.forEach(op => {
      for (let i = 0; i < op.peso; i++) pool.push(op);
    });
    return pool;
  }

  const poolRuleta = crearPoolRuleta();
  let anguloRuletaActual = 0;

  function imgRuletaPorTipo(tipo) {
    const mapa = {
      moneda: IMG.moneda,
      llave: IMG.llave,
      pista: IMG.pista,
      piedra: IMG.piedra
    };
    return mapa[tipo] || IMG.moneda;
  }

  function obtenerSectorPorTipo(tipo) {
    // Filtrar sectores que coincidan con el tipo
    const sectoresDelTipo = RULETA_CONFIG.sectores.filter(s => s.tipo === tipo);
    // Elegir uno aleatorio
    return sectoresDelTipo[Math.floor(Math.random() * sectoresDelTipo.length)];
  }

  function initMisionRuleta() {
    const disco = document.getElementById('ruleta-disco');
    const mensaje = document.getElementById('mensaje-ruleta');
    const registro = document.getElementById('registro-ruleta');
    const btnGirar = document.getElementById('btn-girar-ruleta');
    const btnContinuar = document.getElementById('btn-ruleta-continuar');

    ruletaGiros = estado.resultadosRuleta.length;
    registro.innerHTML = '';
    btnContinuar.classList.add('oculto');
    btnGirar.classList.remove('oculto');
    btnGirar.disabled = false;

    /* Resetear rotación inicial */
    anguloRuletaActual = 0;
    disco.style.transition = 'none';
    disco.style.transform = `rotate(0deg)`;
    // Forzar reflow
    void disco.offsetWidth;

    /* Mostrar giros anteriores */
    estado.resultadosRuleta.forEach(r => {
      const chip = document.createElement('span');
      chip.className = 'chip-resultado';
      const srcImg = r.img || imgRuletaPorTipo(r.tipo);
      if (srcImg) chip.appendChild(crearImg(srcImg, r.tipo));
      chip.appendChild(document.createTextNode(r.tipo));
      registro.appendChild(chip);
    });

    if (ruletaGiros >= ruletaMinimo && misionCompletada('ruleta')) {
      btnGirar.classList.add('oculto');
      btnContinuar.classList.remove('oculto');
      mensaje.textContent = '¡Desafío completado! El tesoro te espera.';
      return;
    }

    mensaje.textContent = ruletaGiros > 0
      ? `Giros: ${ruletaGiros}. ¡Sigue girando!`
      : '¡Presiona girar para descubrir tu premio!';

    let girando = false;

    btnGirar.onclick = async () => {
      if (girando) return;
      girando = true;
      btnGirar.disabled = true;

      // Efecto de partículas al girar
      const rect = disco.getBoundingClientRect();
      crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado)');

      /* 1. Seleccionar resultado basado en probabilidades */
      const resultadoObjeto = poolRuleta[Math.floor(Math.random() * poolRuleta.length)];
      
      /* 2. Obtener un sector que tenga ese tipo de premio */
      const sectorGanador = obtenerSectorPorTipo(resultadoObjeto.tipo);
      
      /* 3. Calcular ángulo de rotación
         La flecha apunta a 0° (arriba). Para que un sector termine bajo la flecha,
         necesitamos rotar la ruleta de forma que ese sector quede en 0°.
         
         Si el sector está en el ángulo X, y queremos que quede en 0°,
         necesitamos rotar: (360 - X) grados (+ vueltas completas)
      */
      
      const vueltasCompletas = 5 + Math.floor(Math.random() * 4); // 5-8 vueltas
      const variacionDentroDelSector = (Math.random() - 0.5) * 30; // ±15 grados dentro del sector
      
      // Calcular cuánto girar para que el sector ganador quede arriba
      const rotacionNecesaria = 360 - sectorGanador.angulo + variacionDentroDelSector;
      const anguloFinal = anguloRuletaActual + (vueltasCompletas * 360) + rotacionNecesaria;
      
      // Aplicar rotación
      disco.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      disco.style.transform = `rotate(${anguloFinal}deg)`;
      
      // Actualizar ángulo actual (normalizado a 0-360)
      anguloRuletaActual = anguloFinal % 360;

      await sleep(4200);

      mensaje.textContent = resultadoObjeto.mensaje;
      destello(disco);

      const chip = document.createElement('span');
      chip.className = 'chip-resultado';
      chip.appendChild(crearImg(resultadoObjeto.img, resultadoObjeto.tipo));
      chip.appendChild(document.createTextNode(resultadoObjeto.tipo));
      registro.appendChild(chip);

      estado.resultadosRuleta.push({ tipo: resultadoObjeto.tipo, img: resultadoObjeto.img });
      ruletaGiros++;
      guardarEstado();

      if (ruletaGiros >= ruletaMinimo) {
        completarMision('ruleta');
        await sleep(600);
        mensaje.textContent = '¡Desafío superado! El tesoro está cerca.';
        btnGirar.classList.add('oculto');
        btnContinuar.classList.remove('oculto');
      } else {
        btnGirar.disabled = false;
      }

      girando = false;
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
