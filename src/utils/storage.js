// Salvataggio dei migliori punteggi in localStorage.
// Manteniamo il record personale (miglior punteggio, a parità tempo minore)
// e lo storico delle ultime partite.

const KEY = "capitali-highscores-v1";
const HISTORY_LIMIT = 8;

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { best: null, history: [] };
    const data = JSON.parse(raw);
    return {
      best: data.best ?? null,
      history: Array.isArray(data.history) ? data.history : [],
    };
  } catch {
    return { best: null, history: [] };
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // localStorage non disponibile
  }
}

/** Restituisce il miglior risultato salvato, o null. */
export function getBest() {
  return read().best;
}

/** Restituisce lo storico delle ultime partite (più recenti prima). */
export function getHistory() {
  return read().history;
}

/**
 * Confronto tra due risultati: quello "migliore" ha punteggio maggiore;
 * a parità di punteggio, il tempo più breve vince. `timeMs` mancante
 * viene trattato come peggiore (Infinity).
 */
function isBetter(a, b) {
  if (!b) return true;
  if (a.score !== b.score) return a.score > b.score;
  const at = Number.isFinite(a.timeMs) ? a.timeMs : Infinity;
  const bt = Number.isFinite(b.timeMs) ? b.timeMs : Infinity;
  return at < bt;
}

/**
 * Salva il risultato di una partita. Restituisce true se è un nuovo record.
 * Include il tempo di gioco (`timeMs`), che entra nel confronto a parità
 * di punteggio.
 */
export function saveResult(score, max, timeMs) {
  const data = read();
  const entry = {
    score,
    max,
    ratio: max > 0 ? score / max : 0,
    timeMs: Number.isFinite(timeMs) ? timeMs : null,
    date: new Date().toISOString(),
  };

  const isRecord = isBetter(entry, data.best);

  const next = {
    best: isRecord ? entry : data.best,
    history: [entry, ...data.history].slice(0, HISTORY_LIMIT),
  };
  write(next);
  return isRecord;
}
