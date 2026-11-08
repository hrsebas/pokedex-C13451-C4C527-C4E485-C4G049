// =============================================================
//  favoritos.js  —  Los Pokémon marcados como favoritos.
//  Mismo patrón que capturados.js: un Set de ids guardado en
//  localStorage, y funciones para leerlo, agregar y quitar.
// =============================================================
const CLAVE = 'pokedex:favoritos';

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

export function esFavorito(id) {
  return leer().has(id);
}

// Agrega varios ids de una vez (los que ya estaban no se repiten).
// Devuelve solo los que eran nuevos, para poder avisar cuántos se marcaron.
export function agregarFavoritos(ids) {
  const favoritos = leer();
  const nuevos = ids.filter((id) => !favoritos.has(id));
  nuevos.forEach((id) => favoritos.add(id));
  escribir(favoritos);
  return nuevos;
}

export function quitarFavorito(id) {
  const favoritos = leer();
  favoritos.delete(id);
  escribir(favoritos);
}

export function listaFavoritos() {
  return [...leer()];
}
