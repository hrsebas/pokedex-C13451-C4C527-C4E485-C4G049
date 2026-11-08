// =============================================================
//  equipo.js  —  El equipo Pokémon (máximo seis).
//  Mismo patrón que capturados.js: un Set de ids guardado en
//  localStorage. La regla extra: si ya hay seis, no entra nadie más.
// =============================================================
const CLAVE = 'pokedex:equipo';

export const MAX_EQUIPO = 6;

// Lee del localStorage y devuelve un Set de ids (sin repetidos).
function leer() {
  try {
    return new Set(JSON.parse(localStorage.getItem(CLAVE)) ?? []);
  } catch {
    return new Set();   // si algo falla (modo privado, etc.), arrancamos vacío
  }
}

// Guarda el Set en localStorage (como texto JSON).
function escribir(conjunto) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify([...conjunto]));
  } catch { /* si no se puede guardar, seguimos sin romper */ }
}

export function estaEnEquipo(id) {
  return leer().has(id);
}

// Agrega los ids en orden mientras quede espacio. Los que ya estaban se
// ignoran; los que no caben se devuelven en `sinEspacio` para poder avisar.
export function agregarAlEquipo(ids) {
  const equipo = leer();
  const agregados = [];
  const sinEspacio = [];

  for (const id of ids) {
    if (equipo.has(id)) continue;
    if (equipo.size >= MAX_EQUIPO) {
      sinEspacio.push(id);
    } else {
      equipo.add(id);
      agregados.push(id);
    }
  }

  escribir(equipo);
  return { agregados, sinEspacio };
}

export function quitarDelEquipo(id) {
  const equipo = leer();
  equipo.delete(id);
  escribir(equipo);
}

export function listaEquipo() {
  return [...leer()];
}
