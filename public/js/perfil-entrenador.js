// =============================================================
//  perfil-entrenador.js  —  Muestra en el perfil los Pokémon
//  que la persona capturó desde la lista (leídos de localStorage).
//  Los diálogos (modales) se abren solos con command/commandfor;
//  este archivo llena el contenido de "Capturados", "Favoritos"
//  y "Equipo".
// =============================================================
import { buscarPorId, numeroPokedex } from './datos.js';
import { listaCapturados } from './capturados.js';
import { listaFavoritos, agregarFavoritos, quitarFavorito } from './favoritos.js';
import { listaEquipo, agregarAlEquipo, quitarDelEquipo, MAX_EQUIPO } from './equipo.js';

function pintarCapturados() {
  // Convierte los ids guardados en fichas completas (y descarta ids raros)
  const capturados = listaCapturados()
    .map(buscarPorId)
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);

  // 1) Resumen de la tarjeta de sección: el número y los mini-sprites
  const detalle = document.querySelector('.seccion--capturados .seccion__detalle');
  if (detalle) {
    detalle.textContent = `${capturados.length} Pokémon en tu colección`;
  }

  const mini = document.querySelector('.seccion--capturados .mini-sprites');
  if (mini) {
    const primeros = capturados.slice(0, 3)
      .map((p) => `<li><img src="assets/${p.slug}.png" alt="" width="34" height="34"></li>`)
      .join('');
    const resto = capturados.length > 3
      ? `<li class="mini-sprites__mas">+${capturados.length - 3}</li>` : '';
    mini.innerHTML = primeros + resto;
  }

  // 2) Grilla dentro del diálogo "Pokémon capturados"
  const grilla = document.querySelector('#modal-capturados .capturados');
  if (grilla) {
    if (capturados.length === 0) {
      grilla.innerHTML = '<li class="capturados__vacio">Todavía no capturaste ninguno. Entrá a la Pokédex y tocá “Capturar”.</li>';
    } else {
      grilla.innerHTML = capturados.map((p) => `
        <li class="captura">
          <input type="checkbox" class="captura__check" id="cap-${p.id}" data-id="${p.id}" aria-label="Seleccionar a ${p.nombre}">
          <label class="captura__cuerpo" for="cap-${p.id}">
            <span class="sprite-zona"><img src="assets/${p.slug}.png" alt="" width="96" height="96"></span>
            <span class="numero">${numeroPokedex(p.id)}</span>
            <span class="captura__nombre">${p.nombre}</span>
          </label>
        </li>`).join('');
    }
    const nota = document.querySelector('#modal-capturados .modal__nota');
    if (nota) nota.textContent = `${capturados.length} Pokémon capturados`;
  }
}

// -------------------------------------------------------------
//  Piezas compartidas por Favoritos y Equipo
// -------------------------------------------------------------

// De los ids guardados a fichas completas (descarta ids raros), en orden de Pokédex
function aPokemon(ids) {
  return ids
    .map(buscarPorId)
    .filter(Boolean)
    .sort((a, b) => a.id - b.id);
}

// En los datos los tipos van sin tilde ('electrico'); acá se arregla el texto visible
const NOMBRE_TIPO = { electrico: 'Eléctrico' };

function nombreTipo(tipo) {
  return NOMBRE_TIPO[tipo] ?? tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function pastillasTipo(pokemon) {
  return pokemon.tipos
    .map((t) => `<span class="tipo tipo--${t}">${nombreTipo(t)}</span>`)
    .join('');
}

// Ícono de la colección de <symbol> del HTML (#i-star, #i-plus, ...)
function icono(nombre, clase = '') {
  return `<svg class="icono ${clase}" aria-hidden="true" width="24" height="24"><use href="#i-${nombre}"/></svg>`;
}

// Tarjeta de sección del perfil: el texto de resumen y los mini-sprites
function pintarResumen(seccion, pokemones, texto) {
  const detalle = document.querySelector(`.seccion--${seccion} .seccion__detalle`);
  if (detalle) detalle.textContent = texto;

  const mini = document.querySelector(`.seccion--${seccion} .mini-sprites`);
  if (mini) {
    const primeros = pokemones.slice(0, 3)
      .map((p) => `<li><img src="assets/${p.slug}.png" alt="" width="34" height="34"></li>`)
      .join('');
    const resto = pokemones.length > 3
      ? `<li class="mini-sprites__mas">+${pokemones.length - 3}</li>` : '';
    mini.innerHTML = primeros + resto;
  }
}

// -------------------------------------------------------------
//  Favoritos
// -------------------------------------------------------------
function pintarFavoritos() {
  const favoritos = aPokemon(listaFavoritos());
  const marcados = `${favoritos.length} Pokémon ${favoritos.length === 1 ? 'marcado' : 'marcados'}`;

  // 1) Tarjeta de sección
  pintarResumen('favoritos', favoritos, marcados);

  // 2) Diálogo "Favoritos"
  const subtitulo = document.querySelector('#modal-favoritos .modal__subtitulo');
  if (subtitulo) subtitulo.textContent = `${marcados} como favoritos`;

  const lista = document.querySelector('#modal-favoritos .favoritos');
  if (!lista) return;

  if (favoritos.length === 0) {
    lista.innerHTML = '<li class="modal__vacio">Todavía no marcaste ningún favorito. Abrí “Pokémon capturados”, seleccioná los que quieras y tocá “Marcar favorito”.</li>';
    return;
  }

  lista.innerHTML = favoritos.map((p) => `
    <li class="favorito">
      <span class="favorito__estrella">${icono('star', 'icono--fav')}</span>
      <div class="sprite-zona sprite-zona--chica"><img src="assets/${p.slug}.png" alt="" width="64" height="64"></div>
      <div class="favorito__datos">
        <h3>${p.nombre} <span class="numero">${numeroPokedex(p.id)}</span></h3>
        <span class="tipos">${pastillasTipo(p)}</span>
      </div>
      <div class="favorito__acciones">
        <a class="boton boton--borde-azul boton--chico" href="detalle.html?id=${p.id}">Ver detalle ${icono('arrow')}</a>
        <button type="button" class="boton boton--borde-rojo boton--chico" data-quitar="${p.id}">Quitar de favoritos<span class="solo-lectores">: ${p.nombre}</span></button>
      </div>
    </li>`).join('');
}

// Un solo listener en la lista (delegación de eventos): sirve también para
// las fichas que se dibujen después, sin tener que volver a conectarlas.
document.querySelector('#modal-favoritos .favoritos')?.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-quitar]');
  if (!boton) return;
  quitarFavorito(Number(boton.dataset.quitar));
  pintarFavoritos();
});

// -------------------------------------------------------------
//  Equipo (máximo MAX_EQUIPO)
// -------------------------------------------------------------
function textoLibres(libres) {
  if (libres === 0) return 'Equipo completo';
  return libres === 1 ? 'Queda 1 espacio libre' : `Quedan ${libres} espacios libres`;
}

function pintarEquipo() {
  const equipo = aPokemon(listaEquipo());
  const libres = Math.max(0, MAX_EQUIPO - equipo.length);
  const ocupados = `${equipo.length} de ${MAX_EQUIPO} espacios ocupados`;

  // 1) Tarjeta de sección
  pintarResumen('equipo', equipo, ocupados);

  // 2) Diálogo "Team Pokémon"
  const subtitulo = document.querySelector('#modal-equipo .modal__subtitulo');
  if (subtitulo) {
    subtitulo.innerHTML = `<span>${ocupados}</span><span>${textoLibres(libres)}</span>`;
  }

  const lista = document.querySelector('#modal-equipo .equipo');
  if (!lista) return;

  if (equipo.length === 0) {
    lista.innerHTML = '<li class="modal__vacio">Tu equipo está vacío. Tocá “Agregar desde capturados” para sumar hasta seis Pokémon.</li>';
    return;
  }

  const fichas = equipo.map((p) => `
    <li class="equipo__ficha">
      <div class="sprite-zona"><span class="numero">${numeroPokedex(p.id)}</span><img src="assets/${p.slug}.png" alt="" width="96" height="96"></div>
      <h3>${p.nombre}</h3>
      <span class="tipos">${pastillasTipo(p)}</span>
      <button type="button" class="boton boton--borde-rojo boton--chico" data-quitar="${p.id}">${icono('minus')} Quitar<span class="solo-lectores"> a ${p.nombre} del equipo</span></button>
    </li>`);

  // Un recuadro "Espacio libre" por cada lugar que falta para llegar a seis
  const espacios = Array.from({ length: libres }, () => `
    <li class="equipo__libre">
      <span class="equipo__mas">${icono('plus')}</span>
      Espacio libre
    </li>`);

  lista.innerHTML = [...fichas, ...espacios].join('');
}

document.querySelector('#modal-equipo .equipo')?.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-quitar]');
  if (!boton) return;
  quitarDelEquipo(Number(boton.dataset.quitar));
  pintarEquipo();
});

// -------------------------------------------------------------
//  Selección en el diálogo "Pokémon capturados"
// -------------------------------------------------------------

// Devuelve los ids de los Pokémon marcados en el diálogo "Pokémon capturados".
function idsSeleccionados() {
  const marcadas = document.querySelectorAll('#modal-capturados .captura__check:checked');
  return [...marcadas].map((casilla) => Number(casilla.dataset.id));
}

// Desmarca todas las casillas (después de guardar la selección).
function limpiarSeleccion() {
  document.querySelectorAll('#modal-capturados .captura__check:checked')
    .forEach((casilla) => { casilla.checked = false; });
}

// Muestra un mensaje en el pie del diálogo "Pokémon capturados".
function avisar(mensaje) {
  const aviso = document.querySelector('#modal-capturados .modal__aviso');
  if (aviso) aviso.textContent = mensaje;
}

pintarCapturados();
pintarFavoritos();
pintarEquipo();

const botonFavorito = document.querySelector('#boton-marcar-favorito');
if (botonFavorito) {
  botonFavorito.addEventListener('click', () => {
    const ids = idsSeleccionados();
    if (ids.length === 0) {
      avisar('Primero seleccioná al menos un Pokémon.');
      return;
    }
    const nuevos = agregarFavoritos(ids);   // guarda en localStorage
    limpiarSeleccion();
    pintarFavoritos();
    avisar(nuevos.length === 0
      ? 'Esos Pokémon ya estaban en favoritos.'
      : `${nuevos.length} Pokémon agregado(s) a favoritos.`);
  });
}

const botonEquipo = document.querySelector('#boton-agregar-equipo');
if (botonEquipo) {
  botonEquipo.addEventListener('click', () => {
    const ids = idsSeleccionados();
    if (ids.length === 0) {
      avisar('Primero seleccioná al menos un Pokémon.');
      return;
    }
    const { agregados, sinEspacio } = agregarAlEquipo(ids);   // respeta el máximo de 6
    limpiarSeleccion();
    pintarEquipo();
    if (sinEspacio.length > 0) {
      avisar(`El equipo admite máximo ${MAX_EQUIPO}: ${agregados.length} agregado(s), ${sinEspacio.length} no cupieron.`);
    } else if (agregados.length === 0) {
      avisar('Esos Pokémon ya estaban en el equipo.');
    } else {
      avisar(`${agregados.length} Pokémon agregado(s) al equipo.`);
    }
  });
}
