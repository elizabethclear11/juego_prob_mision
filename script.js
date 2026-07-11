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
  const CLAVE_PERFIL = 'mision-probabilidad-perfil';
  const CLAVE_REGISTRO = 'mision-probabilidad-registro';
  const MISIONES_ORDEN = ['dado', 'cajas', 'bolsa', 'ruleta'];

  const CATALOGO_PERSONAJES = {
    michiexplorador: {
      id: 'michiexplorador',
      nombre: 'Michi Explorador',
      img: 'img/personajes/gato_explorador.png'
    },
    gato_esquin2: { id: 'gato_esquin2', nombre: 'Michi Aventurero', img: 'img/personajes/gato_esquin2.png' },
    gato_esquin3: { id: 'gato_esquin3', nombre: 'Michi Investigador', img: 'img/personajes/gato_esquin3.png' },
    gato_esquin4: { id: 'gato_esquin4', nombre: 'Michi Ecuador', img: 'img/personajes/gato_esquin4.png' },
    gato_esquin5: { id: 'gato_esquin5', nombre: 'Michi Amor', img: 'img/personajes/gato_esquin5.png' },
    gato_esquin6: { id: 'gato_esquin6', nombre: 'Michi Todologo', img: 'img/personajes/gato_esquin6.png' },
    gato_esquin7: { id: 'gato_esquin7', nombre: 'Michi Especial', img: 'img/personajes/gato_esquin7.png' }
  };

  const POOL_GATOS_DESBLOQUEABLES = [
    'gato_esquin2', 'gato_esquin3', 'gato_esquin4', 'gato_esquin5', 'gato_esquin6', 'gato_esquin7'
  ];

  const IMG_PUNTO = 'img/punto.png';

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
    estadoCajas: null,
    // Estado persistente de Misión 3
    estadoBolsa: null
  };

  const perfilDefault = {
    nombre: '',
    puntosTotales: 0,
    personajesDesbloqueados: ['michiexplorador'],
    personajeActivo: 'michiexplorador',
    recompensasEntregadas: []
  };

  const registroDefault = {
    jugadores: [],
    jugadorActivo: null,
    solicitarNombreAlComenzar: true,
    _migrado: false
  };

  let registro = { ...registroDefault };
  let jugadorActivoKey = null;
  let perfil = { ...perfilDefault };
  let estado = { ...estadoDefault };

  function normalizarNombre(nombre) {
    return (nombre || '').trim().toLowerCase();
  }

  function crearJugadorBase(nombre, extras = {}) {
    const nombreLimpio = (nombre || '').trim();
    return {
      nombre: nombreLimpio,
      nombreKey: normalizarNombre(nombreLimpio),
      puntosTotales: 0,
      personajesDesbloqueados: ['michiexplorador'],
      personajeActivo: 'michiexplorador',
      recompensasEntregadas: [],
      partida: { ...estadoDefault },
      ...extras
    };
  }

  function sanitizarJugador(datos) {
    const base = crearJugadorBase(datos.nombre || 'Explorador', datos);
    if (!base.personajesDesbloqueados.includes('michiexplorador')) {
      base.personajesDesbloqueados.unshift('michiexplorador');
    }
    if (!base.personajeActivo || !CATALOGO_PERSONAJES[base.personajeActivo]) {
      base.personajeActivo = 'michiexplorador';
    }
    base.partida = { ...estadoDefault, ...(datos.partida || {}) };
    return base;
  }

  function cargarRegistro() {
    try {
      const datos = localStorage.getItem(CLAVE_REGISTRO);
      if (!datos) return { ...registroDefault };
      const parsed = JSON.parse(datos);
      return {
        ...registroDefault,
        ...parsed,
        jugadores: Array.isArray(parsed.jugadores)
          ? parsed.jugadores.map(sanitizarJugador)
          : []
      };
    } catch {
      return { ...registroDefault };
    }
  }

  function guardarRegistro() {
    localStorage.setItem(CLAVE_REGISTRO, JSON.stringify(registro));
  }

  function perfilDesdeJugador(jugador) {
    return {
      nombre: jugador.nombre,
      puntosTotales: jugador.puntosTotales || 0,
      personajesDesbloqueados: [...jugador.personajesDesbloqueados],
      personajeActivo: jugador.personajeActivo,
      recompensasEntregadas: [...(jugador.recompensasEntregadas || [])]
    };
  }

  function cargarJugadorEnMemoria(jugador) {
    jugadorActivoKey = jugador.nombreKey;
    perfil = perfilDesdeJugador(jugador);
    estado = { ...estadoDefault, ...jugador.partida };
    registro.jugadorActivo = jugador.nombreKey;
  }

  function persistirJugadorActivo() {
    if (!jugadorActivoKey) return;
    const jugador = registro.jugadores.find(j => j.nombreKey === jugadorActivoKey);
    if (!jugador) return;
    jugador.nombre = perfil.nombre;
    jugador.puntosTotales = perfil.puntosTotales || 0;
    jugador.personajesDesbloqueados = [...perfil.personajesDesbloqueados];
    jugador.personajeActivo = perfil.personajeActivo;
    jugador.recompensasEntregadas = [...(perfil.recompensasEntregadas || [])];
    jugador.partida = { ...estado };
  }

  function activarJugador(nombre) {
    const nombreLimpio = (nombre || '').trim();
    const key = normalizarNombre(nombreLimpio);
    if (!key) return false;

    let jugador = registro.jugadores.find(j => j.nombreKey === key);
    if (!jugador) {
      jugador = sanitizarJugador(crearJugadorBase(nombreLimpio));
      registro.jugadores.push(jugador);
    } else {
      jugador.nombre = nombreLimpio;
    }

    registro.jugadorActivo = key;
    registro.solicitarNombreAlComenzar = false;
    cargarJugadorEnMemoria(jugador);
    guardarRegistro();
    return true;
  }

  function migrarSistemaJugadores() {
    registro = cargarRegistro();
    if (registro._migrado) return;

    try {
      const datosPerfil = localStorage.getItem(CLAVE_PERFIL);
      const datosEstado = localStorage.getItem(CLAVE_GUARDADO);
      if (datosPerfil) {
        const antiguo = { ...perfilDefault, ...JSON.parse(datosPerfil) };
        if (antiguo.nombre && antiguo.nombre.trim()) {
          const partida = datosEstado
            ? { ...estadoDefault, ...JSON.parse(datosEstado) }
            : { ...estadoDefault };
          const jugador = sanitizarJugador({
            nombre: antiguo.nombre,
            puntosTotales: antiguo.puntosTotales,
            personajesDesbloqueados: antiguo.personajesDesbloqueados,
            personajeActivo: antiguo.personajeActivo,
            recompensasEntregadas: antiguo.recompensasEntregadas,
            partida
          });
          registro.jugadores.push(jugador);
          registro.jugadorActivo = jugador.nombreKey;
          registro.solicitarNombreAlComenzar = false;
        }
      }
    } catch {
      /* ignorar errores de migración */
    }

    registro._migrado = true;
    guardarRegistro();
  }

  function restaurarSesionActiva() {
    if (registro.solicitarNombreAlComenzar || !registro.jugadorActivo) {
      jugadorActivoKey = null;
      perfil = { ...perfilDefault };
      estado = { ...estadoDefault };
      return;
    }

    const jugador = registro.jugadores.find(j => j.nombreKey === registro.jugadorActivo);
    if (jugador) {
      cargarJugadorEnMemoria(jugador);
    } else {
      registro.jugadorActivo = null;
      registro.solicitarNombreAlComenzar = true;
      jugadorActivoKey = null;
      perfil = { ...perfilDefault };
      estado = { ...estadoDefault };
      guardarRegistro();
    }
  }

  function inicializarAlmacenamiento() {
    migrarSistemaJugadores();
    restaurarSesionActiva();
  }

  function guardarPerfil() {
    persistirJugadorActivo();
    guardarRegistro();
  }

  function migrarMonedasAlPerfil() {
    const monedasPartida = estado.monedasDado || 0;
    if (monedasPartida > 0 && !estado._puntosMigradosAlPerfil) {
      perfil.puntosTotales = (perfil.puntosTotales || 0) + monedasPartida;
      estado.monedasDado = 0;
      estado._puntosMigradosAlPerfil = true;
      guardarPerfil();
      guardarEstado();
    }
  }

  function puntosAdicionalesParaDesbloqueo(indice) {
    return 3 + 2 * indice;
  }

  function umbralAcumuladoDesbloqueo(indice) {
    let total = 0;
    for (let i = 0; i <= indice; i++) {
      total += puntosAdicionalesParaDesbloqueo(i);
    }
    return total;
  }

  function obtenerPersonaje(id) {
    return CATALOGO_PERSONAJES[id] || CATALOGO_PERSONAJES.michiexplorador;
  }

  function obtenerImgPersonajeActivo() {
    return obtenerPersonaje(perfil.personajeActivo).img;
  }

  function actualizarBarraPuntos() {
    const total = String(perfil.puntosTotales || 0);
    ['numero-puntos-global', 'numero-monedas', 'numero-monedas-cajas', 'numero-monedas-ruleta'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = total;
    });
    const contadores = document.querySelectorAll('.contador-monedas, .contador-puntos-global');
    contadores.forEach(c => {
      c.classList.remove('pulso-puntos');
      void c.offsetWidth;
      c.classList.add('pulso-puntos');
    });
  }

  function aplicarPersonajeActivo() {
    const src = obtenerImgPersonajeActivo();
    const nombre = obtenerPersonaje(perfil.personajeActivo).nombre;
    const viajero = document.querySelector('#michi-viajero img');
    if (viajero) {
      viajero.src = src;
      viajero.alt = nombre;
    }
    const camino = document.getElementById('michi-camino');
    if (camino) {
      camino.src = src;
      camino.alt = nombre;
    }
    const inicioIcono = document.querySelector('.punto-mapa[data-id="inicio"] .punto-icono img');
    if (inicioIcono) {
      inicioIcono.src = src;
      inicioIcono.alt = nombre;
    }
  }

  function actualizarVisibilidadHud() {
    const hud = document.getElementById('hud-global');
    const activa = document.querySelector('.pantalla.activa');
    if (!hud || !activa) return;
    const ocultar = activa.id === 'pantalla-inicio' || activa.id === 'pantalla-historia';
    hud.classList.toggle('oculto', ocultar);
  }

  function elegirGatoAleatorio() {
    const disponibles = POOL_GATOS_DESBLOQUEABLES.filter(
      id => !perfil.personajesDesbloqueados.includes(id)
    );
    if (!disponibles.length) return null;
    const id = disponibles[Math.floor(Math.random() * disponibles.length)];
    return CATALOGO_PERSONAJES[id];
  }

  function revisarDesbloqueos() {
    const nuevos = [];
    let indice = perfil.recompensasEntregadas.length;

    while (true) {
      const umbral = umbralAcumuladoDesbloqueo(indice);
      if ((perfil.puntosTotales || 0) < umbral) break;
      if (perfil.recompensasEntregadas.includes(umbral)) {
        indice++;
        continue;
      }
      const gato = elegirGatoAleatorio();
      if (!gato) break;
      perfil.personajesDesbloqueados.push(gato.id);
      perfil.personajeActivo = gato.id;
      perfil.recompensasEntregadas.push(umbral);
      nuevos.push(gato);
      indice++;
    }

    if (nuevos.length) guardarPerfil();
    return nuevos;
  }

  async function animarPuntoUno(origenEl) {
    const capa = document.getElementById('capa-animacion-puntos');
    const destino = document.getElementById('contador-puntos-global') ||
      document.getElementById('numero-puntos-global');
    if (!capa || !destino) return;

    const destRect = destino.getBoundingClientRect();
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2;
    if (origenEl && origenEl.getBoundingClientRect) {
      const r = origenEl.getBoundingClientRect();
      startX = r.left + r.width / 2;
      startY = r.top + r.height / 2;
    }

    const el = document.createElement('div');
    el.className = 'anim-punto-vuelo';
    el.innerHTML = `<img src="${IMG_PUNTO}" alt="">+1`;
    el.style.left = startX + 'px';
    el.style.top = startY + 'px';
    capa.appendChild(el);

    const endX = destRect.left + destRect.width / 2;
    const endY = destRect.top + destRect.height / 2;

    await el.animate([
      { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(1.15)', opacity: 1, offset: 0.2 },
      { transform: `translate(${endX - startX - 20}px, ${endY - startY - 10}px) scale(0.85)`, opacity: 0.9, offset: 0.85 },
      { transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.4)`, opacity: 0 }
    ], { duration: 750, easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)', fill: 'forwards' }).finished;

    el.remove();
  }

  async function animarPuntosGanados(cantidad, origenEl) {
    const veces = Math.min(cantidad, 10);
    for (let i = 0; i < veces; i++) {
      await animarPuntoUno(origenEl);
      if (veces > 1 && i < veces - 1) await sleep(120);
    }
    if (cantidad > 10) await sleep(300);
  }

  function mostrarModalNuevoPersonaje(gato) {
    return new Promise(resolve => {
      const modal = document.getElementById('modal-nuevo-personaje');
      const img = document.getElementById('modal-nuevo-gato-img');
      const nombre = document.getElementById('modal-nuevo-gato-nombre');
      const btn = document.getElementById('btn-cerrar-nuevo-personaje');
      if (!modal || !img || !nombre || !btn) {
        resolve();
        return;
      }
      img.src = gato.img;
      img.alt = gato.nombre;
      nombre.textContent = gato.nombre;
      modal.showModal();
      const cerrar = () => {
        modal.close();
        btn.removeEventListener('click', cerrar);
        resolve();
      };
      btn.addEventListener('click', cerrar);
    });
  }

  async function addPoints(cantidad, opciones = {}) {
    if (!cantidad || cantidad < 1) return;
    const { animar = true, origen = null } = opciones;

    perfil.puntosTotales = (perfil.puntosTotales || 0) + cantidad;
    guardarPerfil();
    actualizarBarraPuntos();

    if (animar) {
      await animarPuntosGanados(cantidad, origen);
    }

    const desbloqueos = revisarDesbloqueos();
    for (const gato of desbloqueos) {
      aplicarPersonajeActivo();
      await mostrarModalNuevoPersonaje(gato);
    }
  }

  function renderPersonajesGrid() {
    const grid = document.getElementById('personajes-grid');
    if (!grid) return;
    grid.innerHTML = '';
    perfil.personajesDesbloqueados.forEach(id => {
      const p = obtenerPersonaje(id);
      const tarjeta = document.createElement('div');
      tarjeta.className = 'personaje-tarjeta' + (perfil.personajeActivo === id ? ' activo' : '');

      const img = crearImg(p.img, p.nombre);
      const nom = document.createElement('span');
      nom.className = 'personaje-tarjeta-nombre';
      nom.textContent = p.nombre;

      const estadoLbl = document.createElement('span');
      estadoLbl.className = 'personaje-tarjeta-estado';

      if (perfil.personajeActivo === id) {
        estadoLbl.textContent = 'Usando';
      } else {
        const btnSel = document.createElement('button');
        btnSel.type = 'button';
        btnSel.className = 'btn btn-secundario';
        btnSel.textContent = 'Seleccionar';
        btnSel.onclick = () => {
          perfil.personajeActivo = id;
          guardarPerfil();
          aplicarPersonajeActivo();
          renderPersonajesGrid();
        };
        tarjeta.appendChild(img);
        tarjeta.appendChild(nom);
        tarjeta.appendChild(btnSel);
        grid.appendChild(tarjeta);
        return;
      }

      tarjeta.appendChild(img);
      tarjeta.appendChild(nom);
      tarjeta.appendChild(estadoLbl);
      grid.appendChild(tarjeta);
    });
  }

  function actualizarModalProgreso() {
    persistirJugadorActivo();
    guardarRegistro();

    const cuerpo = document.getElementById('progreso-tabla-cuerpo');
    const vacio = document.getElementById('progreso-sin-datos');
    if (!cuerpo) return;

    cuerpo.innerHTML = '';
    const jugadoresOrdenados = [...registro.jugadores].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );

    if (!jugadoresOrdenados.length) {
      if (vacio) vacio.classList.remove('oculto');
      return;
    }

    if (vacio) vacio.classList.add('oculto');

    jugadoresOrdenados.forEach(jugador => {
      const fila = document.createElement('tr');
      if (jugador.nombreKey === jugadorActivoKey) {
        fila.classList.add('progreso-fila-activa');
      }

      const celdaNombre = document.createElement('td');
      celdaNombre.textContent = jugador.nombre;
      celdaNombre.dataset.label = 'Nombre';

      const celdaGatos = document.createElement('td');
      celdaGatos.dataset.label = 'Gatos coleccionados';
      const gatos = (jugador.personajesDesbloqueados || [])
        .map(id => obtenerPersonaje(id).nombre)
        .join(', ');
      celdaGatos.textContent = gatos || '—';

      const celdaPuntos = document.createElement('td');
      celdaPuntos.textContent = String(jugador.puntosTotales || 0);
      celdaPuntos.dataset.label = 'Puntos acumulados';

      fila.appendChild(celdaNombre);
      fila.appendChild(celdaGatos);
      fila.appendChild(celdaPuntos);
      cuerpo.appendChild(fila);
    });
  }

  function solicitarNombreExplorador() {
    const modal = document.getElementById('modal-perfil-inicial');
    const input = document.getElementById('input-nombre-jugador');
    const btn = document.getElementById('btn-guardar-perfil');
    if (!modal || !input || !btn) return Promise.resolve(false);

    return new Promise(resolve => {
      input.value = '';
      modal.showModal();
      input.focus();

      const guardar = () => {
        const nombre = input.value.trim();
        if (!nombre) {
          input.focus();
          return;
        }
        activarJugador(nombre);
        modal.close();
        btn.removeEventListener('click', guardar);
        input.removeEventListener('keypress', onEnter);
        resolve(true);
      };

      const onEnter = (e) => {
        if (e.key === 'Enter') guardar();
      };

      btn.addEventListener('click', guardar);
      input.addEventListener('keypress', onEnter);
    });
  }

  function verificarPerfilInicial() {
    if (!registro.solicitarNombreAlComenzar && jugadorActivoKey && perfil.nombre) {
      return Promise.resolve(true);
    }
    return solicitarNombreExplorador();
  }

  /* Estado temporal de misiones activas */
  let dadoMeta = 15;
  let ruletaGiros = 0;
  let ruletaMinimo = 5;
  let bolsaIntentos = 0;
  let bolsaMinimoGrafico = 8;
  const RULETA_ACIERTOS_REQUERIDOS = 3;
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
    persistirJugadorActivo();
    guardarRegistro();
  }

  function mensajeAleatorio(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    const pantalla = document.getElementById('pantalla-' + id);
    if (pantalla) pantalla.classList.add('activa');
    actualizarVisibilidadHud();
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
    aplicarPersonajeActivo();
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
    const animacionMoneda = document.getElementById('animacion-moneda');
    const contadorMonedas = document.getElementById('numero-monedas');
    const cofreFinal = document.getElementById('cofre-final');
    const cofreCerrado = document.getElementById('cofre-cerrado');
    const cofreAbiertoLlave = document.getElementById('cofre-abierto-llave');

    // Modal de resultado
    const modalResultado = document.getElementById('modal-resultado-dado');
    const modalGato      = document.getElementById('modal-dado-gato');
    const modalTitulo    = document.getElementById('modal-dado-titulo');
    const modalMensaje   = document.getElementById('modal-dado-mensaje');
    const modalDadoCara  = document.getElementById('modal-dado-cara');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal-dado');

    let posicion = estado.posicionDado || 0;
    let lanzando = false;
    let totalLanzamientos = estado.dadoLanzamientos || 0;
    let aciertos = estado.dadoAciertos || 0;

    actualizarBarraPuntos();
    aplicarPersonajeActivo();

    /* Construir sendero visual con SOLO números */
    sendero.innerHTML = '';
    for (let i = 0; i <= dadoMeta; i++) {
      const paso = document.createElement('div');
      paso.className = 'paso-sendero' + (i === posicion ? ' activo' : '') + (i === dadoMeta ? ' meta' : '');
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
      mensaje.textContent = 'Has alcanzado la llave para abrir el siguiente nivel.';
      btnLanzar.classList.add('oculto');
      cofreFinal.classList.remove('oculto');
      setTimeout(() => {
        cofreCerrado.classList.add('oculto');
        cofreAbiertoLlave.classList.remove('oculto');
      }, 1000);
      btnContinuar.classList.remove('oculto');
      return;
    }

    mensaje.textContent = 'Ingresa tu predicción (1-6) y lanza el dado. Solo avanzas si aciertas.';

    /* Mostrar modal con gato según resultado */
    function mostrarModalResultado(correcto, resultadoDado, pasosReales) {
      return new Promise(resolve => {
        modalDadoCara.src = `img/dados/dado${resultadoDado}.png`;
        modalDadoCara.alt = `Dado: ${resultadoDado}`;

        if (correcto) {
          modalGato.src = 'img/personajes/michi-celebrando.png';
          modalGato.alt = 'Michi celebrando';
          modalTitulo.textContent = '¡Felicidades!';
          modalMensaje.textContent = `Predijiste correctamente. Avanzas ${pasosReales} paso${pasosReales !== 1 ? 's' : ''}.`;
          modalResultado.className = 'modal modal-resultado-dado modal-acierto';
        } else {
          modalGato.src = 'img/personajes/gato_desagrado.png';
          modalGato.alt = 'Michi triste';
          modalTitulo.textContent = 'Esta vez no fue';
          modalMensaje.textContent = 'Tu predicción fue incorrecta. No avanzas este turno.';
          modalResultado.className = 'modal modal-resultado-dado modal-fallo';
        }

        modalResultado.showModal();

        const cerrar = () => {
          modalResultado.close();
          btnCerrarModal.removeEventListener('click', cerrar);
          resolve();
        };
        btnCerrarModal.addEventListener('click', cerrar);
      });
    }

    btnLanzar.onclick = async () => {
      if (lanzando || posicion >= dadoMeta) return;

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

      const rect = dado.getBoundingClientRect();
      crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado-brillo)');

      dado.classList.add('girando');
      await sleep(900);

      const resultado = Math.floor(Math.random() * 6) + 1;
      dadoImg.src = `img/dados/dado${resultado}.png`;
      dado.classList.remove('girando');
      destello(dado);

      totalLanzamientos++;
      const predictionCorrecta = (prediccion === resultado);
      if (predictionCorrecta) {
        aciertos++;
        await addPoints(1, { origen: dado });
      }

      estado.dadoLanzamientos = totalLanzamientos;
      estado.dadoAciertos = aciertos;

      prediccionResultado.classList.remove('oculto');
      resultadoDadoNum.textContent = resultado;
      resultadoVerificacion.textContent = predictionCorrecta
        ? '✓ Tu predicción fue CORRECTA'
        : '✗ Tu predicción fue INCORRECTA';
      resultadoVerificacion.className = 'resultado-verificacion ' + (predictionCorrecta ? 'correcto' : 'incorrecto');

      let pasosReales = 0;
      if (predictionCorrecta) {
        const nuevaPos = Math.min(posicion + resultado, dadoMeta);
        pasosReales = nuevaPos - posicion;
        posicion = nuevaPos;
        estado.posicionDado = posicion;

        if (michi) {
          michi.style.transform = `translateX(${Math.min(posicion * 8, 80)}px)`;
        }

        sendero.querySelectorAll('.paso-sendero').forEach(p => {
          p.classList.remove('activo');
          if (parseInt(p.dataset.paso, 10) === posicion) p.classList.add('activo');
        });
      }

      guardarEstado();

      // Mostrar modal con gato antes de continuar
      await mostrarModalResultado(predictionCorrecta, resultado, pasosReales);

      if (posicion >= dadoMeta) {
        mensaje.textContent = 'Has alcanzado la llave para abrir el siguiente nivel.';
        completarMision('dado');
        btnLanzar.classList.add('oculto');
        cofreFinal.classList.remove('oculto');
        setTimeout(() => {
          cofreCerrado.classList.add('oculto');
          cofreAbiertoLlave.classList.remove('oculto');
          const cofreRect = cofreFinal.getBoundingClientRect();
          crearParticulas(cofreRect.left + cofreRect.width / 2, cofreRect.top + cofreRect.height / 2, 'var(--dorado-brillo)');
        }, 1500);
        setTimeout(() => btnContinuar.classList.remove('oculto'), 3000);
      } else {
        prediccionInput.value = '';
        prediccionInput.focus();
        btnLanzar.disabled = false;
        mensaje.textContent = predictionCorrecta
          ? '¡Bien! Ingresa tu siguiente predicción (1-6) y lanza el dado.'
          : 'Debes acertar para avanzar. Ingresa tu predicción (1-6) y lanza el dado.';
      }

      lanzando = false;
    };

    prediccionInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !lanzando) btnLanzar.click();
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

    // Modal de resultado de caja
    const modalCaja         = document.getElementById('modal-resultado-caja');
    const modalCajaGato     = document.getElementById('modal-caja-gato');
    const modalCajaTitulo   = document.getElementById('modal-caja-titulo');
    const modalCajaObjEleg  = document.getElementById('modal-caja-obj-elegido');
    const modalCajaNomEleg  = document.getElementById('modal-caja-nombre-elegido');
    const modalCajaObjReal  = document.getElementById('modal-caja-obj-real');
    const modalCajaNomReal  = document.getElementById('modal-caja-nombre-real');
    const modalCajaMensaje  = document.getElementById('modal-caja-mensaje');
    const btnCerrarModalCaja = document.getElementById('btn-cerrar-modal-caja');

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
      actualizarBarraPuntos();
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
          await addPoints(1, { origen: btnAbrir });
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

      /* ── Modal de resultado ─────────────────────────────────── */
      await mostrarModalResultadoCaja(acerto, prediccionSeleccionada, resultado, !esRepeticion);

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

    /* ── Modal resultado de caja ────────────────────────────── */
    function mostrarModalResultadoCaja(acerto, prediccion, resultadoReal) {
      return new Promise(resolve => {
        const srcElegido = prediccion === 'moneda' ? IMG.moneda : IMG.piedra;
        const nomElegido = prediccion === 'moneda' ? 'Moneda' : 'Piedra';
        const srcReal    = resultadoReal === 'moneda' ? IMG.moneda : IMG.piedra;
        const nomReal    = resultadoReal === 'moneda' ? 'Moneda' : 'Piedra';

        modalCajaObjEleg.src = srcElegido;
        modalCajaObjEleg.alt = nomElegido;
        modalCajaNomEleg.textContent = nomElegido;
        modalCajaObjReal.src = srcReal;
        modalCajaObjReal.alt = nomReal;
        modalCajaNomReal.textContent = nomReal;

        if (acerto) {
          modalCajaGato.src = 'img/personajes/michi-celebrando.png';
          modalCajaGato.alt = 'Michi celebrando';
          modalCajaTitulo.textContent = '¡Acertaste!';
          modalCajaMensaje.textContent = 'Predijiste correctamente el objeto que salió de la caja.';
          modalCaja.className = 'modal modal-resultado-caja modal-acierto';
        } else {
          modalCajaGato.src = 'img/personajes/gato_desagrado.png';
          modalCajaGato.alt = 'Michi triste';
          modalCajaTitulo.textContent = 'No acertaste';
          modalCajaMensaje.textContent = 'El objeto que salió no fue el que predijiste. Tendrás que intentarlo de nuevo.';
          modalCaja.className = 'modal modal-resultado-caja modal-fallo';
        }

        modalCaja.showModal();

        const cerrar = () => {
          modalCaja.close();
          btnCerrarModalCaja.removeEventListener('click', cerrar);
          resolve();
        };
        btnCerrarModalCaja.addEventListener('click', cerrar);
      });
    }

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

  const COMPOSICIONES_BOLSA = [
    { id: 0, blueCount: 2, silverCount: 8, blueProbability: 20, silverProbability: 80 },
    { id: 1, blueCount: 4, silverCount: 6, blueProbability: 40, silverProbability: 60 },
    { id: 2, blueCount: 5, silverCount: 5, blueProbability: 50, silverProbability: 50 },
    { id: 3, blueCount: 6, silverCount: 4, blueProbability: 60, silverProbability: 40 },
    { id: 4, blueCount: 8, silverCount: 2, blueProbability: 80, silverProbability: 20 }
  ];

  const MUESTRAS_BOLSA_MAX = 5;
  const PUNTOS_BOLSA_ACIERTO = 10;
  const OPORTUNIDADES_PUNTOS_BOLSA = 3;

  function crearEstadoBolsaNuevo() {
    const idx = Math.floor(Math.random() * COMPOSICIONES_BOLSA.length);
    const comp = COMPOSICIONES_BOLSA[idx];
    return {
      selectedCompositionId: comp.id,
      actualBlueCount: comp.blueCount,
      actualSilverCount: comp.silverCount,
      blueProbability: comp.blueProbability,
      silverProbability: comp.silverProbability,
      gamePhase: 'sampling',
      sampleDraws: 0,
      sampleBlueCount: 0,
      sampleSilverCount: 0,
      sampleHistory: [],
      selectedPrediction: null,
      predictionLocked: false,
      rewardGranted: false,
      missionCompleted: false,
      isCorrect: null,
      failedAttempts: 0
    };
  }

  function crearEstadoBolsaLegacyCompletado() {
    const base = crearEstadoBolsaNuevo();
    return {
      ...base,
      gamePhase: 'result',
      sampleDraws: MUESTRAS_BOLSA_MAX,
      predictionLocked: true,
      rewardGranted: true,
      missionCompleted: true,
      isCorrect: null
    };
  }

  function extraerFichaMuestra(sb) {
    const total = sb.actualBlueCount + sb.actualSilverCount;
    return Math.random() * total < sb.actualBlueCount ? 'azul' : 'plata';
  }

  function crearFilaProporcionBolsa(bluePct, silverPct) {
    const fila = document.createElement('div');
    fila.className = 'bolsa-proporcion-visual';

    [[bluePct, IMG.fichaAzul, 'Ficha azul'], [silverPct, IMG.fichaPlata, 'Ficha plateada']]
      .forEach(([pct, src, alt]) => {
        const lado = document.createElement('div');
        lado.className = 'bolsa-proporcion-lado';
        lado.appendChild(crearImg(src, alt, 'bolsa-proporcion-ficha'));
        const pctEl = document.createElement('span');
        pctEl.className = 'bolsa-proporcion-pct';
        pctEl.textContent = pct + '%';
        lado.appendChild(pctEl);
        fila.appendChild(lado);
      });

    return fila;
  }

  function crearEstrellasBolsa() {
    const capa = document.createElement('div');
    capa.className = 'bolsa-estrellas-acierto';
    document.body.appendChild(capa);
    for (let i = 0; i < 14; i++) {
      const estrella = document.createElement('span');
      estrella.className = 'bolsa-estrella';
      estrella.textContent = '★';
      estrella.style.left = (10 + Math.random() * 80) + '%';
      estrella.style.top = (15 + Math.random() * 55) + '%';
      estrella.style.animationDelay = (Math.random() * 0.4) + 's';
      estrella.style.color = Math.random() > 0.5 ? 'var(--dorado-brillo)' : 'var(--dorado-claro)';
      capa.appendChild(estrella);
    }
    setTimeout(() => capa.remove(), 1400);
  }

  function initMisionBolsa() {
    const bolsa = document.getElementById('bolsa-clic');
    const ficha = document.getElementById('ficha-saliente');
    const mensaje = document.getElementById('mensaje-bolsa');
    const contador = document.getElementById('contador-bolsa');
    const narracion = document.getElementById('bolsa-narracion');
    const grafico = document.getElementById('grafico-bolsa');
    const panelPrediccion = document.getElementById('bolsa-prediccion-panel');
    const panelRevelacion = document.getElementById('bolsa-revelacion-panel');
    const panelResultado = document.getElementById('bolsa-resultado-panel');
    const opcionesPrediccion = document.getElementById('bolsa-opciones-prediccion');
    const btnConfirmar = document.getElementById('btn-bolsa-confirmar');
    const btnReintentar = document.getElementById('btn-bolsa-reintentar');
    const btnContinuar = document.getElementById('btn-bolsa-continuar');
    const avisoPrediccion = document.getElementById('bolsa-aviso-prediccion');
    const modalBolsa = document.getElementById('modal-resultado-bolsa');
    const modalBolsaGato = document.getElementById('modal-bolsa-gato');
    const modalBolsaTitulo = document.getElementById('modal-bolsa-titulo');
    const modalBolsaComposicion = document.getElementById('modal-bolsa-composicion');
    const modalBolsaMensaje = document.getElementById('modal-bolsa-mensaje');
    const btnCerrarModalBolsa = document.getElementById('btn-cerrar-modal-bolsa');
    const barraAzul = document.getElementById('barra-azul');
    const barraPlata = document.getElementById('barra-roja');
    const numAzul = document.getElementById('num-azul');
    const numPlata = document.getElementById('num-roja');
    const statsConteo = document.getElementById('bolsa-stats-conteo');
    const statsPorcentaje = document.getElementById('bolsa-stats-porcentaje');
    const revelAzulCount = document.getElementById('bolsa-revel-azul-count');
    const revelPlataCount = document.getElementById('bolsa-revel-plata-count');
    const fichasAzul = document.getElementById('bolsa-fichas-azul');
    const fichasPlata = document.getElementById('bolsa-fichas-plata');
    const resultadoTexto = document.getElementById('bolsa-resultado-texto');
    const explicacionEducativa = document.getElementById('bolsa-explicacion-educativa');
    const animPuntos = document.getElementById('animacion-moneda-bolsa');

    if (!estado.estadoBolsa) {
      estado.estadoBolsa = misionCompletada('bolsa')
        ? crearEstadoBolsaLegacyCompletado()
        : crearEstadoBolsaNuevo();
      guardarEstado();
    }

    const sb = estado.estadoBolsa;
    if (typeof sb.failedAttempts !== 'number') sb.failedAttempts = 0;
    const compGuardada = COMPOSICIONES_BOLSA.find(c => c.id === sb.selectedCompositionId);
    if (compGuardada) {
      sb.actualBlueCount = compGuardada.blueCount;
      sb.actualSilverCount = compGuardada.silverCount;
      sb.blueProbability = compGuardada.blueProbability;
      sb.silverProbability = compGuardada.silverProbability;
    }

    let ocupado = false;
    let prediccionSeleccionada = sb.selectedPrediction;

    function guardarBolsa() {
      guardarEstado();
    }

    function oportunidadesPuntosRestantes() {
      return Math.max(0, OPORTUNIDADES_PUNTOS_BOLSA - sb.failedAttempts);
    }

    function puedeGanarPuntosBolsa() {
      return sb.isCorrect && oportunidadesPuntosRestantes() > 0 && !sb.rewardGranted;
    }

    function actualizarAvisoPrediccion() {
      if (!avisoPrediccion) return;
      const restantes = oportunidadesPuntosRestantes();
      if (restantes > 0) {
        avisoPrediccion.textContent =
          `Tienes ${restantes} oportunidad${restantes === 1 ? '' : 'es'} para ganar ${PUNTOS_BOLSA_ACIERTO} puntos. Debes acertar para avanzar.`;
      } else {
        avisoPrediccion.textContent =
          'Ya no puedes ganar puntos extra. Debes acertar para continuar al siguiente reto.';
      }
    }

    function asignarNuevaComposicionBolsa(excluirId) {
      let opciones = COMPOSICIONES_BOLSA;
      if (excluirId !== undefined && opciones.length > 1) {
        opciones = opciones.filter(c => c.id !== excluirId);
      }
      const comp = opciones[Math.floor(Math.random() * opciones.length)];
      sb.selectedCompositionId = comp.id;
      sb.actualBlueCount = comp.blueCount;
      sb.actualSilverCount = comp.silverCount;
      sb.blueProbability = comp.blueProbability;
      sb.silverProbability = comp.silverProbability;
    }

    function prepararNuevoIntento() {
      const composicionAnterior = sb.selectedCompositionId;
      asignarNuevaComposicionBolsa(composicionAnterior);

      sb.gamePhase = 'sampling';
      sb.sampleDraws = 0;
      sb.sampleBlueCount = 0;
      sb.sampleSilverCount = 0;
      sb.sampleHistory = [];
      sb.selectedPrediction = null;
      sb.predictionLocked = false;
      sb.isCorrect = null;
      prediccionSeleccionada = null;

      panelResultado.classList.add('oculto');
      panelRevelacion.classList.add('oculto');
      panelPrediccion.classList.add('oculto');
      if (btnReintentar) btnReintentar.classList.add('oculto');
      fichasAzul.innerHTML = '';
      fichasPlata.innerHTML = '';
      revelAzulCount.textContent = '0';
      revelPlataCount.textContent = '0';
      ficha.innerHTML = '';
      grafico.classList.add('oculto');

      actualizarContadorMuestras();
      actualizarPanelMuestras();
      actualizarAvisoPrediccion();

      narracion.textContent = '¡Toca la bolsa y descubre qué hay dentro!';
      mensaje.textContent = 'Toca la bolsa para observar cinco fichas de muestra.';
      setBolsaInteractiva(true);
      bolsa.onclick = sacarMuestra;

      guardarBolsa();
    }

    function mostrarModalBolsa(ganaPuntosEsteIntento) {
      return new Promise(resolve => {
        modalBolsaComposicion.innerHTML = '';
        modalBolsaComposicion.appendChild(
          crearFilaProporcionBolsa(sb.blueProbability, sb.silverProbability)
        );

        if (sb.isCorrect) {
          modalBolsaGato.src = 'img/personajes/michi-celebrando.png';
          modalBolsaGato.alt = 'Michi celebrando';
          modalBolsaTitulo.textContent = '¡Predicción correcta!';
          modalBolsaMensaje.textContent = ganaPuntosEsteIntento
            ? '¡Pasaste a la siguiente ronda!'
            : '¡Pasaste a la siguiente ronda! Ya no podías ganar los 10 puntos extra.';
          modalBolsa.className = 'modal modal-resultado-bolsa modal-acierto';
        } else {
          modalBolsaGato.src = 'img/personajes/gato_desagrado.png';
          modalBolsaGato.alt = 'Michi triste';
          modalBolsaTitulo.textContent = 'Esta vez no fue';
          const restantes = oportunidadesPuntosRestantes();
          if (restantes > 0) {
            modalBolsaMensaje.textContent =
              `Te quedan ${restantes} oportunidad${restantes === 1 ? '' : 'es'} para ganar ${PUNTOS_BOLSA_ACIERTO} puntos. Debes acertar para avanzar.`;
          } else {
            modalBolsaMensaje.textContent =
              `Ya no puedes ganar los ${PUNTOS_BOLSA_ACIERTO} puntos. Debes acertar para continuar al siguiente reto.`;
          }
          modalBolsa.className = 'modal modal-resultado-bolsa modal-fallo';
        }

        modalBolsa.showModal();

        const cerrar = () => {
          modalBolsa.close();
          btnCerrarModalBolsa.removeEventListener('click', cerrar);
          resolve();
        };
        btnCerrarModalBolsa.addEventListener('click', cerrar);
      });
    }

    function actualizarContadorMuestras() {
      contador.textContent = `Muestra ${sb.sampleDraws} de ${MUESTRAS_BOLSA_MAX}`;
    }

    function actualizarPanelMuestras() {
      const total = sb.sampleDraws;
      const pctAzul = total > 0 ? Math.round((sb.sampleBlueCount / total) * 100) : 0;
      const pctPlata = total > 0 ? Math.round((sb.sampleSilverCount / total) * 100) : 0;

      if (total > 0) {
        grafico.classList.remove('oculto');
      } else {
        grafico.classList.add('oculto');
      }

      statsConteo.textContent = `Azules: ${sb.sampleBlueCount} · Plateadas: ${sb.sampleSilverCount}`;
      statsPorcentaje.textContent =
        `Azules observadas: ${pctAzul} % · Plateadas observadas: ${pctPlata} %`;
      numAzul.textContent = sb.sampleBlueCount;
      numPlata.textContent = sb.sampleSilverCount;
      barraAzul.style.setProperty('--altura', Math.max(pctAzul, total > 0 ? 8 : 10) + '%');
      barraPlata.style.setProperty('--altura', Math.max(pctPlata, total > 0 ? 8 : 10) + '%');
    }

    function setBolsaInteractiva(activa) {
      bolsa.classList.toggle('bloqueada', !activa);
      bolsa.disabled = !activa;
    }

    function renderOpcionesPrediccion() {
      opcionesPrediccion.innerHTML = '';
      const bloqueada = sb.predictionLocked;

      COMPOSICIONES_BOLSA.forEach(comp => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bolsa-opcion-btn';
        if (prediccionSeleccionada === comp.id) btn.classList.add('seleccionada');
        btn.disabled = bloqueada;
        btn.dataset.id = String(comp.id);
        btn.appendChild(crearFilaProporcionBolsa(comp.blueProbability, comp.silverProbability));

        btn.onclick = () => {
          if (sb.predictionLocked || sb.gamePhase !== 'prediction') return;
          prediccionSeleccionada = comp.id;
          sb.selectedPrediction = comp.id;
          renderOpcionesPrediccion();
          btnConfirmar.disabled = false;
          guardarBolsa();
        };

        opcionesPrediccion.appendChild(btn);
      });

      btnConfirmar.disabled = bloqueada || prediccionSeleccionada === null;
    }

    function mostrarFasePrediccion() {
      sb.gamePhase = 'prediction';
      setBolsaInteractiva(false);
      narracion.textContent = 'Hora de predecir la composición completa de la bolsa.';
      mensaje.textContent =
        'Según las fichas que observaste, ¿cuál crees que es la composición real de la bolsa?';
      panelPrediccion.classList.remove('oculto');
      actualizarAvisoPrediccion();
      renderOpcionesPrediccion();
      guardarBolsa();
    }

    async function sacarMuestra() {
      if (ocupado || sb.gamePhase !== 'sampling' || sb.sampleDraws >= MUESTRAS_BOLSA_MAX) return;
      ocupado = true;
      setBolsaInteractiva(false);

      const rect = bolsa.getBoundingClientRect();
      crearParticulas(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--dorado-claro)');

      bolsa.classList.add('sacudiendo');
      await sleep(400);
      bolsa.classList.remove('sacudiendo');

      const color = extraerFichaMuestra(sb);
      sb.sampleHistory.push(color);
      sb.sampleDraws++;
      if (color === 'azul') sb.sampleBlueCount++;
      else sb.sampleSilverCount++;

      const srcFicha = color === 'azul' ? IMG.fichaAzul : IMG.fichaPlata;
      const altFicha = color === 'azul' ? 'Ficha azul' : 'Ficha plateada';

      ficha.innerHTML = '';
      ficha.appendChild(crearImg(srcFicha, altFicha));
      ficha.classList.remove('aparece', 'regresa');
      void ficha.offsetWidth;
      ficha.classList.add('aparece');
      destello(bolsa);
      destello(ficha);

      actualizarContadorMuestras();
      actualizarPanelMuestras();
      mensaje.textContent = color === 'azul'
        ? 'Observaste una ficha azul. La ficha vuelve a la bolsa.'
        : 'Observaste una ficha plateada. La ficha vuelve a la bolsa.';

      guardarBolsa();
      await sleep(700);

      ficha.classList.add('regresa');
      await sleep(450);
      ficha.innerHTML = '';
      ficha.classList.remove('aparece', 'regresa');

      if (sb.sampleDraws >= MUESTRAS_BOLSA_MAX) {
        mensaje.textContent = 'Completaste las cinco muestras. Ahora haz tu predicción.';
        mostrarFasePrediccion();
      } else {
        setBolsaInteractiva(true);
      }

      ocupado = false;
    }

    async function revelarBolsa(animar) {
      sb.gamePhase = 'revealing';
      panelPrediccion.classList.add('oculto');
      panelRevelacion.classList.remove('oculto');
      setBolsaInteractiva(false);
      narracion.textContent = 'La bolsa se vacía y revela su contenido real.';
      mensaje.textContent = 'Observa las diez fichas que había dentro de la bolsa.';

      fichasAzul.innerHTML = '';
      fichasPlata.innerHTML = '';
      revelAzulCount.textContent = '0';
      revelPlataCount.textContent = '0';
      guardarBolsa();

      const fichas = [];
      for (let i = 0; i < sb.actualBlueCount; i++) fichas.push('azul');
      for (let i = 0; i < sb.actualSilverCount; i++) fichas.push('plata');
      for (let i = fichas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fichas[i], fichas[j]] = [fichas[j], fichas[i]];
      }

      let azulReveladas = 0;
      let plataReveladas = 0;

      if (animar) {
        bolsa.classList.add('vaciando');
        for (const color of fichas) {
          bolsa.classList.remove('vaciando');
          void bolsa.offsetWidth;
          bolsa.classList.add('vaciando');
          await sleep(320);

          const img = crearImg(
            color === 'azul' ? IMG.fichaAzul : IMG.fichaPlata,
            color === 'azul' ? 'Ficha azul' : 'Ficha plateada'
          );
          if (color === 'azul') {
            azulReveladas++;
            fichasAzul.appendChild(img);
            revelAzulCount.textContent = String(azulReveladas);
          } else {
            plataReveladas++;
            fichasPlata.appendChild(img);
            revelPlataCount.textContent = String(plataReveladas);
          }
        }
        bolsa.classList.remove('vaciando');
        await sleep(400);
      } else {
        for (const color of fichas) {
          const img = crearImg(
            color === 'azul' ? IMG.fichaAzul : IMG.fichaPlata,
            color === 'azul' ? 'Ficha azul' : 'Ficha plateada'
          );
          if (color === 'azul') {
            azulReveladas++;
            fichasAzul.appendChild(img);
          } else {
            plataReveladas++;
            fichasPlata.appendChild(img);
          }
        }
        revelAzulCount.textContent = String(azulReveladas);
        revelPlataCount.textContent = String(plataReveladas);
      }

      await mostrarResultado(animar);
    }

    function otorgarPuntosBolsa() {
      if (!puedeGanarPuntosBolsa()) return Promise.resolve();
      sb.rewardGranted = true;
      guardarBolsa();
      const rect = bolsa.getBoundingClientRect();
      crearEstrellasBolsa();
      destello(bolsa);
      return addPoints(PUNTOS_BOLSA_ACIERTO, { origen: bolsa });
    }

    function finalizarMisionBolsa() {
      if (!sb.missionCompleted) {
        sb.missionCompleted = true;
        completarMision('bolsa');
        guardarBolsa();
      }
      btnContinuar.classList.remove('oculto');
    }

    async function mostrarResultado(animarExtras) {
      sb.gamePhase = 'result';

      panelResultado.classList.remove('oculto');
      resultadoTexto.innerHTML = '';
      explicacionEducativa.innerHTML = '';
      explicacionEducativa.classList.add('oculto');
      if (btnReintentar) btnReintentar.classList.add('oculto');
      btnContinuar.classList.add('oculto');

      if (sb.isCorrect) {
        const titulo = document.createElement('h4');
        titulo.textContent = '¡Predicción correcta!';
        resultadoTexto.appendChild(titulo);
        resultadoTexto.appendChild(
          crearFilaProporcionBolsa(sb.blueProbability, sb.silverProbability)
        );
        narracion.textContent = '¡Excelente predicción!';
        mensaje.textContent = '';

        const ganaPuntosEsteIntento = !sb.rewardGranted && oportunidadesPuntosRestantes() > 0;
        if (ganaPuntosEsteIntento) {
          if (animarExtras) {
            await otorgarPuntosBolsa();
          } else {
            sb.rewardGranted = true;
            guardarBolsa();
            await addPoints(PUNTOS_BOLSA_ACIERTO, { animar: false });
          }
        }

        guardarBolsa();
        await mostrarModalBolsa(ganaPuntosEsteIntento);
        finalizarMisionBolsa();
        return;
      }

      const titulo = document.createElement('h4');
      titulo.textContent = 'Esta vez tu predicción no fue correcta.';
      resultadoTexto.appendChild(titulo);
      resultadoTexto.appendChild(
        crearFilaProporcionBolsa(sb.blueProbability, sb.silverProbability)
      );
      narracion.textContent = 'Sigue observando y aprendiendo.';
      mensaje.textContent = '';

      guardarBolsa();
      await mostrarModalBolsa(false);
      if (btnReintentar) btnReintentar.classList.remove('oculto');
    }

    async function confirmarPrediccion() {
      if (sb.predictionLocked || prediccionSeleccionada === null) return;

      sb.predictionLocked = true;
      sb.selectedPrediction = prediccionSeleccionada;
      sb.isCorrect = prediccionSeleccionada === sb.selectedCompositionId;
      if (!sb.isCorrect) {
        sb.failedAttempts = (sb.failedAttempts || 0) + 1;
      }
      btnConfirmar.disabled = true;
      renderOpcionesPrediccion();
      guardarBolsa();

      mensaje.textContent = 'Predicción confirmada. Revelando el contenido de la bolsa...';
      await revelarBolsa(true);
    }

    function restaurarFase() {
      btnContinuar.classList.add('oculto');
      if (btnReintentar) btnReintentar.classList.add('oculto');
      animPuntos.classList.add('oculto');
      panelPrediccion.classList.add('oculto');
      panelRevelacion.classList.add('oculto');
      panelResultado.classList.add('oculto');
      ficha.innerHTML = '';

      actualizarContadorMuestras();
      actualizarPanelMuestras();

      if (sb.gamePhase === 'sampling') {
        narracion.textContent = '¡Toca la bolsa y descubre qué hay dentro!';
        mensaje.textContent = 'Toca la bolsa para observar cinco fichas de muestra.';
        const puedeSacar = sb.sampleDraws < MUESTRAS_BOLSA_MAX;
        setBolsaInteractiva(puedeSacar);
        bolsa.onclick = sacarMuestra;
        if (!puedeSacar) mostrarFasePrediccion();
        return;
      }

      setBolsaInteractiva(false);
      bolsa.onclick = null;

      if (sb.gamePhase === 'prediction') {
        narracion.textContent = 'Hora de predecir la composición completa de la bolsa.';
        mensaje.textContent =
          'Según las fichas que observaste, ¿cuál crees que es la composición real de la bolsa?';
        panelPrediccion.classList.remove('oculto');
        actualizarAvisoPrediccion();
        renderOpcionesPrediccion();
        return;
      }

      if (sb.gamePhase === 'revealing') {
        panelRevelacion.classList.remove('oculto');
        revelarBolsa(false);
        return;
      }

      if (sb.gamePhase === 'result') {
        panelRevelacion.classList.remove('oculto');
        fichasAzul.innerHTML = '';
        fichasPlata.innerHTML = '';
        for (let i = 0; i < sb.actualBlueCount; i++) {
          fichasAzul.appendChild(crearImg(IMG.fichaAzul, 'Ficha azul'));
        }
        for (let i = 0; i < sb.actualSilverCount; i++) {
          fichasPlata.appendChild(crearImg(IMG.fichaPlata, 'Ficha plateada'));
        }
        revelAzulCount.textContent = String(sb.actualBlueCount);
        revelPlataCount.textContent = String(sb.actualSilverCount);

        if (sb.missionCompleted) {
          panelResultado.classList.remove('oculto');
          resultadoTexto.innerHTML = '';
          const titulo = document.createElement('h4');
          titulo.textContent = '¡Predicción correcta!';
          resultadoTexto.appendChild(titulo);
          resultadoTexto.appendChild(
            crearFilaProporcionBolsa(sb.blueProbability, sb.silverProbability)
          );
          btnContinuar.classList.remove('oculto');
          return;
        }

        mostrarResultado(false).then(() => {
          if (!sb.missionCompleted && !sb.isCorrect && btnReintentar) {
            btnReintentar.classList.remove('oculto');
          }
        });
      }
    }

    btnConfirmar.onclick = confirmarPrediccion;
    if (btnReintentar) btnReintentar.onclick = prepararNuevoIntento;
    restaurarFase();
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
    const btnReintentar = document.getElementById('btn-ruleta-reintentar');
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
    const michiImg = document.getElementById('ruleta-michi-img');
    const cntMonedas = document.getElementById('numero-monedas-ruleta');
    const resumenTitulo = panelResumen ? panelResumen.querySelector('.ruleta-resumen-titulo') : null;
    const zonaRuleta = document.getElementById('imagenRuleta');

    if (!estado.resultadosRuleta) estado.resultadosRuleta = [];

    let intentosRealizados = estado.resultadosRuleta.length;
    let prediccionSeleccionada = null;
    let girando = false;

    function restaurarMichiRuleta() {
      if (!michiImg) return;
      michiImg.src = obtenerImgPersonajeActivo();
      michiImg.alt = obtenerPersonaje(perfil.personajeActivo).nombre;
    }

    actualizarBarraPuntos();
    restaurarMichiRuleta();

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
        contadorIntentos.textContent =
          `Aciertos: ${contarAciertos()}/${RULETA_ACIERTOS_REQUERIDOS}`;
      }
    }

    function crearItemPremioModal(premio) {
      const item = document.createElement('div');
      item.className = 'ruleta-modal-premio';
      item.appendChild(crearImg(premio.img, premio.label));
      const texto = document.createElement('span');
      texto.textContent = premio.label;
      item.appendChild(texto);
      return item;
    }

    function mostrarModalRuleta(acerto, resultadoPremio, predPremio) {
      return new Promise(resolve => {
        const modal = document.getElementById('modal-resultado-ruleta');
        const gato = document.getElementById('modal-ruleta-gato');
        const titulo = document.getElementById('modal-ruleta-titulo');
        const comparacionEl = document.getElementById('modal-ruleta-comparacion');
        const mensajeEl = document.getElementById('modal-ruleta-mensaje');
        const btn = document.getElementById('btn-cerrar-modal-ruleta');

        if (!modal || !gato || !titulo || !comparacionEl || !mensajeEl || !btn) {
          resolve();
          return;
        }

        gato.src = acerto
          ? 'img/personajes/michi-celebrando.png'
          : 'img/personajes/gato_desagrado.png';
        gato.alt = acerto ? 'Michi celebrando' : 'Michi triste';
        modal.className = acerto
          ? 'modal modal-resultado-bolsa modal-acierto'
          : 'modal modal-resultado-bolsa modal-fallo';
        titulo.textContent = acerto ? '¡Predicción correcta!' : 'Esta vez no fue';

        comparacionEl.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'ruleta-modal-grid';

        const colReal = document.createElement('div');
        colReal.className = 'ruleta-modal-col';
        const lblReal = document.createElement('p');
        lblReal.textContent = 'La ruleta eligió:';
        colReal.appendChild(lblReal);
        colReal.appendChild(crearItemPremioModal(resultadoPremio));

        const colPred = document.createElement('div');
        colPred.className = 'ruleta-modal-col';
        const lblPred = document.createElement('p');
        lblPred.textContent = 'Tu predicción fue:';
        colPred.appendChild(lblPred);
        colPred.appendChild(crearItemPremioModal(predPremio));

        grid.appendChild(colReal);
        grid.appendChild(colPred);
        comparacionEl.appendChild(grid);

        const aciertosActuales = contarAciertos();
        if (acerto && aciertosActuales >= RULETA_ACIERTOS_REQUERIDOS) {
          mensajeEl.textContent = '¡Ya tienes 3 aciertos! Puedes ir al tesoro.';
        } else if (acerto) {
          mensajeEl.textContent = `¡Lo adivinaste! Te faltan ${RULETA_ACIERTOS_REQUERIDOS - aciertosActuales} acierto${RULETA_ACIERTOS_REQUERIDOS - aciertosActuales === 1 ? '' : 's'} para avanzar.`;
        } else {
          mensajeEl.textContent = 'Sigue intentando. Observa las probabilidades de cada premio.';
        }

        modal.showModal();

        const cerrar = () => {
          modal.close();
          btn.removeEventListener('click', cerrar);
          resolve();
        };
        btn.addEventListener('click', cerrar);
      });
    }

    function finalizarRuletaCompletada() {
      panelPrediccion.classList.add('oculto');
      panelProb.classList.add('oculto');
      panelResultado.classList.add('oculto');
      btnGirar.classList.add('oculto');
      if (btnSiguiente) btnSiguiente.classList.add('oculto');
      if (btnReintentar) btnReintentar.classList.add('oculto');
      btnContinuar.classList.remove('oculto');
      mensaje.textContent = '¡Desafío superado! El tesoro te espera.';
      michiMensaje.textContent = '¡Increíble! Aprendiste que la probabilidad guía nuestras expectativas.';
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
      restaurarMichiRuleta();
      actualizarContador();
      mensaje.textContent = contarAciertos() >= RULETA_ACIERTOS_REQUERIDOS
        ? '¡Misión completada!'
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

    /* Inicializar UI estática */
    renderProbabilidades();
    renderOpcionesPrediccion();

    rotacionAcumulada = 0;
    disco.style.transition = 'none';
    disco.style.transform = 'rotate(0deg)';
    void disco.offsetWidth;

    btnContinuar.classList.add('oculto');
    panelResumen.classList.add('oculto');
    zonaRuleta.classList.remove('oculto');

    if (misionCompletada('ruleta') || contarAciertos() >= RULETA_ACIERTOS_REQUERIDOS) {
      if (!misionCompletada('ruleta')) completarMision('ruleta');
      finalizarRuletaCompletada();
      return;
    }

    resetFasePrediccion();

    btnGirar.onclick = async () => {
      if (girando || !prediccionSeleccionada) return;
      if (contarAciertos() >= RULETA_ACIERTOS_REQUERIDOS) return;

      girando = true;
      btnGirar.disabled = true;
      opcionesPrediccion.querySelectorAll('.ruleta-opcion-btn').forEach(b => { b.disabled = true; });
      panelResultado.classList.add('oculto');

      mensaje.textContent = '¡La ruleta gira!';
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

      if (acerto) {
        sonidoAciertoRuleta();
        await addPoints(1, { origen: zonaRuleta });
      }

      await mostrarModalRuleta(acerto, resultadoPremio, predPremio);
      actualizarContador();

      if (contarAciertos() >= RULETA_ACIERTOS_REQUERIDOS) {
        if (!misionCompletada('ruleta')) completarMision('ruleta');
        finalizarRuletaCompletada();
      } else {
        resetFasePrediccion();
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

  function reiniciarPartida() {
    persistirJugadorActivo();

    if (jugadorActivoKey) {
      const jugador = registro.jugadores.find(j => j.nombreKey === jugadorActivoKey);
      if (jugador) {
        jugador.partida = { ...estadoDefault };
      }
    }

    estado = { ...estadoDefault };
    estado.estadoCajas = null;
    estado.estadoBolsa = null;

    registro.jugadorActivo = null;
    registro.solicitarNombreAlComenzar = true;
    jugadorActivoKey = null;
    perfil = { ...perfilDefault };

    guardarRegistro();
    actualizarMapa();
    mostrarPantalla('inicio');
    actualizarIndicadorPartida();
    actualizarBarraPuntos();
    aplicarPersonajeActivo();
  }

  function borrarProgresoTotal() {
    registro = { ...registroDefault, _migrado: true };
    guardarRegistro();
    jugadorActivoKey = null;
    perfil = { ...perfilDefault };
    estado = { ...estadoDefault };
    reiniciarPartida();
  }

  function reiniciarJuego() {
    reiniciarPartida();
  }

  /* ═══════════════════════════════════════
     EVENTOS DE NAVEGACIÓN
     ═══════════════════════════════════════ */
  
  /* Verificar si hay partida guardada y actualizar UI */
  function actualizarIndicadorPartida() {
    const btnComenzar = document.getElementById('btn-comenzar');
    const badgeGuardado = document.getElementById('badge-guardado');
    
    const hayPartida = !registro.solicitarNombreAlComenzar &&
                       jugadorActivoKey &&
                       (estado.misionesCompletadas.length > 0 ||
                        estado.posicionDado > 0 ||
                        estado.dadoLanzamientos > 0);
    
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
    document.getElementById('btn-comenzar').addEventListener('click', async () => {
      const ok = await verificarPerfilInicial();
      if (!ok) return;
      actualizarBarraPuntos();
      aplicarPersonajeActivo();
      actualizarIndicadorPartida();
      mostrarPantalla('historia');
    });

    document.getElementById('btn-mi-progreso').addEventListener('click', () => {
      actualizarModalProgreso();
      document.getElementById('modal-mi-progreso').showModal();
    });

    document.getElementById('btn-cerrar-progreso').addEventListener('click', () => {
      document.getElementById('modal-mi-progreso').close();
    });

    document.getElementById('btn-borrar-progreso-total').addEventListener('click', () => {
      document.getElementById('modal-mi-progreso').close();
      document.getElementById('modal-borrar-progreso').showModal();
    });

    document.getElementById('btn-confirmar-borrar-total').addEventListener('click', () => {
      borrarProgresoTotal();
      document.getElementById('modal-borrar-progreso').close();
    });

    document.getElementById('btn-cancelar-borrar-total').addEventListener('click', () => {
      document.getElementById('modal-borrar-progreso').close();
    });

    document.getElementById('btn-personajes-hud').addEventListener('click', () => {
      renderPersonajesGrid();
      document.getElementById('modal-personajes').showModal();
    });

    document.getElementById('btn-cerrar-personajes').addEventListener('click', () => {
      document.getElementById('modal-personajes').close();
    });

    /* Botón de reiniciar en el inicio */
    const modalReiniciar = document.getElementById('modal-reiniciar');
    document.getElementById('btn-reiniciar-inicio').addEventListener('click', () => {
      modalReiniciar.showModal();
    });

    document.getElementById('btn-confirmar-reinicio').addEventListener('click', () => {
      reiniciarPartida();
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
    inicializarAlmacenamiento();
    migrarMonedasAlPerfil();
    revisarDesbloqueos();
    actualizarBarraPuntos();
    aplicarPersonajeActivo();
    initEventos();
    crearChispas();
    actualizarMapa();
    actualizarIndicadorPartida();
    actualizarVisibilidadHud();

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
