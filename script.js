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
      '¡Qué buena suerte!',
      '¡Michi encontró otra pista!',
      '¡Sigue explorando!',
      '¡Qué emoción!'
    ],
    sinMoneda: [
      'Esta vez no apareció una moneda.',
      'Solo una piedra esta vez.',
      '¡Sigue explorando!',
      'Michi no se rinde.'
    ],
    neutral: [
      '¡Sigue explorando!',
      'Michi encontró otra pista.',
      '¡Qué interesante!',
      'Observa qué pasa si repites.'
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
  function actualizarMapa() {
    const nodos = document.querySelectorAll('.nodo-mapa[data-id]');
    nodos.forEach(nodo => {
      const id = nodo.dataset.id;
      const estadoNodo = nodo.querySelector('.nodo-estado');

      nodo.classList.remove('bloqueado', 'completado', 'disponible');

      if (id === 'inicio') {
        nodo.classList.add('completado');
        if (estadoNodo) estadoNodo.textContent = '✓';
        return;
      }

      if (misionCompletada(id)) {
        nodo.classList.add('completado');
        if (estadoNodo) estadoNodo.textContent = '⭐';
      } else if (misionDesbloqueada(id)) {
        nodo.classList.add('disponible');
        if (estadoNodo) estadoNodo.textContent = '→';
      } else {
        nodo.classList.add('bloqueado');
        if (estadoNodo) estadoNodo.textContent = '🔒';
      }
    });
  }

  function irAMision(id) {
    if (!misionDesbloqueada(id) && id !== 'tesoro') return;

    if (id === 'tesoro') {
      if (MISIONES_ORDEN.every(m => misionCompletada(m))) {
        iniciarFinal();
      }
      return;
    }

    mostrarPantalla(id);
    inicializarMision(id);
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
      mensaje.textContent = '¡Michi llegó al final del camino!';
      btnLanzar.classList.add('oculto');
      btnContinuar.classList.remove('oculto');
      return;
    }

    mensaje.textContent = 'Presiona el dado para avanzar.';

    btnLanzar.onclick = async () => {
      if (lanzando || posicion >= dadoMeta) return;
      lanzando = true;
      btnLanzar.disabled = true;

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

      mensaje.textContent = `¡Salió ${resultado}! Michi avanza ${pasosReales} paso${pasosReales !== 1 ? 's' : ''}. ${mensajeAleatorio(MENSAJES.neutral)}`;

      if (posicion >= dadoMeta) {
        await sleep(800);
        mensaje.textContent = '¡Michi encontró otra pista! El camino continúa.';
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
    mensaje.textContent = 'Abre las cajas que quieras explorar.';

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
          mensaje.textContent = '¡Michi encontró otra pista! Puedes seguir explorando o continuar.';
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
        ? '¡Salió una ficha azul! ' + mensajeAleatorio(MENSAJES.neutral)
        : '¡Salió una ficha de plata! ' + mensajeAleatorio(MENSAJES.neutral);

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
  const RULETA_OPCIONES = [
    { tipo: 'moneda', img: IMG.moneda, peso: 40, mensaje: '¡Qué buena suerte! Encontraste una moneda.' },
    { tipo: 'llave', img: IMG.llave, peso: 25, mensaje: '¡Michi encontró otra pista! Una llave misteriosa.' },
    { tipo: 'pista', img: IMG.pista, peso: 20, mensaje: '¡Michi encontró otra pista!' },
    { tipo: 'piedra', img: IMG.piedra, peso: 15, mensaje: 'Esta vez solo una piedra. ¡Sigue explorando!' }
  ];

  function crearPoolRuleta() {
    const pool = [];
    RULETA_OPCIONES.forEach(op => {
      for (let i = 0; i < op.peso; i++) pool.push(op);
    });
    return pool;
  }

  const poolRuleta = crearPoolRuleta();
  let anguloRuleta = 0;

  function imgRuletaPorTipo(tipo) {
    const mapa = {
      moneda: IMG.moneda,
      llave: IMG.llave,
      pista: IMG.pista,
      piedra: IMG.piedra
    };
    return mapa[tipo] || IMG.moneda;
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
      mensaje.textContent = '¡La ruleta te guió bien! El tesoro te espera.';
      return;
    }

    mensaje.textContent = ruletaGiros > 0
      ? `Has girado ${ruletaGiros} vez${ruletaGiros !== 1 ? 'es' : ''}. ¡Sigue!`
      : '¡Presiona girar!';

    let girando = false;

    btnGirar.onclick = async () => {
      if (girando) return;
      girando = true;
      btnGirar.disabled = true;

      const resultado = poolRuleta[Math.floor(Math.random() * poolRuleta.length)];
      const girosExtra = 5 + Math.floor(Math.random() * 3);
      anguloRuleta += girosExtra * 360 + Math.random() * 360;

      disco.style.transform = `rotate(${anguloRuleta}deg)`;

      await sleep(4000);

      mensaje.textContent = resultado.mensaje;
      destello(disco);

      const chip = document.createElement('span');
      chip.className = 'chip-resultado';
      chip.appendChild(crearImg(resultado.img, resultado.tipo));
      chip.appendChild(document.createTextNode(resultado.tipo));
      registro.appendChild(chip);

      estado.resultadosRuleta.push({ tipo: resultado.tipo, img: resultado.img });
      ruletaGiros++;
      guardarEstado();

      if (ruletaGiros >= ruletaMinimo) {
        completarMision('ruleta');
        await sleep(600);
        mensaje.textContent = '¡Lo lograste! El tesoro está cerca.';
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

    document.querySelectorAll('.nodo-mapa[data-id]').forEach(nodo => {
      nodo.addEventListener('click', () => {
        const id = nodo.dataset.id;
        if (id === 'inicio') return;
        if (nodo.classList.contains('bloqueado')) return;
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
      const nodoTesoro = document.querySelector('.nodo-mapa[data-id="tesoro"]');
      if (nodoTesoro) {
        nodoTesoro.classList.remove('bloqueado');
        nodoTesoro.classList.add('disponible');
      }
    }
  });

})();
