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
    posicionDado: 0
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
    dado: { top: 80, left: 20 },     // Dado en círculo dorado, abajo izquierda
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
    const michi = document.getElementById('michi-camino');

    let posicion = estado.posicionDado || 0;
    let lanzando = false;

    /* Construir sendero visual */
    sendero.innerHTML = '';
    for (let i = 0; i <= dadoMeta; i++) {
      const paso = document.createElement('div');
      paso.className = 'paso-sendero' + (i === posicion ? ' activo' : '') + (i === dadoMeta ? ' meta' : '');
      paso.textContent = i === dadoMeta ? '💎' : i;
      paso.dataset.paso = i;
      sendero.appendChild(paso);
    }

    btnContinuar.classList.add('oculto');
    btnLanzar.classList.remove('oculto');
    btnLanzar.disabled = false;

    if (posicion >= dadoMeta) {
      mensaje.textContent = '¡Meta alcanzada!';
      btnLanzar.classList.add('oculto');
      btnContinuar.classList.remove('oculto');
      return;
    }

    mensaje.textContent = 'Toca el dado o el botón para lanzar';

    btnLanzar.onclick = async () => {
      if (lanzando || posicion >= dadoMeta) return;
      lanzando = true;
      btnLanzar.disabled = true;

      // Efecto de partículas al lanzar
      const rect = dado.getBoundingClientRect();
      crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado-brillo)');

      /* Animación de giro */
      dado.classList.add('girando');

      await sleep(900);

      const resultado = Math.floor(Math.random() * 6) + 1;
      dado.classList.remove('girando');
      destello(dado);

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

      mensaje.textContent = `Salió ${resultado}! ${pasosReales > 0 ? '+' + pasosReales + ' pasos' : ''} ${mensajeAleatorio(MENSAJES.neutral)}`;

      if (posicion >= dadoMeta) {
        await sleep(800);
        mensaje.textContent = '¡Meta alcanzada! Michi encontró una pista.';
        completarMision('dado');
        btnLanzar.classList.add('oculto');
        btnContinuar.classList.remove('oculto');
      } else {
        btnLanzar.disabled = false;
      }

      lanzando = false;
    };
  }

  /* ═══════════════════════════════════════
     MISIÓN 2: CAJAS
     ═══════════════════════════════════════ */
  function initMisionCajas() {
    const contenedor = document.getElementById('cajas-contenedor');
    const resultado = document.getElementById('resultado-caja');
    const registro = document.getElementById('registro-cajas');
    const mensaje = document.getElementById('mensaje-cajas');
    const btnContinuar = document.getElementById('btn-cajas-continuar');

    cajasAbiertas = 0;
    resultado.innerHTML = '';
    registro.innerHTML = '';
    btnContinuar.classList.add('oculto');
    mensaje.textContent = 'Abre las cajas que quieras';

    const nombresCaja = { azul: 'Azul', verde: 'Bronce', roja: 'Hierro' };
    const imgsCaja = { azul: IMG.cajas.azul, verde: IMG.cajas.bronce, roja: IMG.cajas.hierro };

    contenedor.querySelectorAll('.caja-item').forEach(caja => {
      caja.classList.remove('abierta', 'deshabilitada');
      const nombre = caja.dataset.caja;
      const cuerpo = caja.querySelector('.caja-cuerpo');
      cuerpo.innerHTML = '';
      cuerpo.appendChild(crearImg(imgsCaja[nombre] || caja.dataset.img, 'Caja', 'caja-img'));

      caja.onclick = async () => {
        if (caja.classList.contains('abierta')) return;

        // Efecto de partículas al hacer clic
        const rect = caja.getBoundingClientRect();
        crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado)');

        const prob = parseFloat(caja.dataset.prob);
        const hayMoneda = Math.random() < prob;

        caja.classList.add('abierta');
        cajasAbiertas++;

        await sleep(500);

        const srcObjeto = hayMoneda ? IMG.moneda : IMG.piedra;
        const altObjeto = hayMoneda ? 'Moneda dorada' : 'Piedra gris';

        cuerpo.innerHTML = '';
        cuerpo.appendChild(crearImg(srcObjeto, altObjeto, 'objeto-resultado'));

        resultado.innerHTML = '';
        resultado.appendChild(crearImg(srcObjeto, altObjeto, 'objeto-resultado'));
        resultado.style.animation = 'none';
        void resultado.offsetWidth;
        resultado.style.animation = '';
        destello(caja);
        destello(resultado);

        const texto = hayMoneda
          ? mensajeAleatorio(MENSAJES.suerte)
          : mensajeAleatorio(MENSAJES.sinMoneda);
        mensaje.textContent = texto;

        const etiqueta = nombresCaja[nombre] || nombre;

        estado.resultadosCajas.push({ caja: nombre, moneda: hayMoneda });
        guardarEstado();

        const chip = document.createElement('span');
        chip.className = 'chip-resultado';
        chip.appendChild(crearImg(srcObjeto, altObjeto));
        chip.appendChild(document.createTextNode(etiqueta));
        registro.appendChild(chip);

        if (cajasAbiertas >= cajasMinimo) {
          completarMision('cajas');
          btnContinuar.classList.remove('oculto');
          mensaje.textContent = '¡Desafío completado! Puedes seguir o continuar.';
        }
      };
    });
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
    guardarEstado();
    estado.posicionDado = 0;
    actualizarMapa();
    mostrarPantalla('inicio');
  }

  /* ═══════════════════════════════════════
     EVENTOS DE NAVEGACIÓN
     ═══════════════════════════════════════ */
  function initEventos() {
    /* Inicio */
    document.getElementById('btn-comenzar').addEventListener('click', () => {
      mostrarPantalla('historia');
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
