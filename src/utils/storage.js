// Salvataggio dei migliori punteggi in localStorage.
// Manteniamo il record personale (percentuale più alta) e lo storico delle ultime partite.

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
    // localStorage non disponibile (es. modalità privata): ignoriamo silenziosamente
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
 * Salva il risultato di una partita. Restituisce true se è un nuovo record.
 * Il confronto è per rapporto punteggio/massimo (percentuale), a parità
 * vince il punteggio assoluto più alto.
 */
export function saveResult(score, max) {
  const data = read();
  const entry = {
    score,
    max,
    ratio: max > 0 ? score / max : 0,
    date: new Date().toISOString(),
  };

  const isRecord =
    !data.best ||
    entry.ratio > data.best.ratio ||
    (entry.ratio === data.best.ratio && entry.score > data.best.score);

  const next = {
    best: isRecord ? entry : data.best,
    history: [entry, ...data.history].slice(0, HISTORY_LIMIT),
  };
  write(next);
  return isRecord;
}
