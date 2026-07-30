// Salvataggio della partita in corso in localStorage.
// La sessione scade dopo 2 giorni dall'ultimo salvataggio: ogni volta che
// scriviamo lo stato, aggiorniamo `updatedAt` = adesso; quindi finché il
// giocatore torna almeno una volta ogni 2 giorni, la partita resta viva.

const KEY = "capitali-session-v1";
const TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 giorni

/** Legge la sessione se ancora valida, altrimenti null. */
export function loadSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data.updatedAt !== "number") return null;
    if (Date.now() - data.updatedAt > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Salva lo stato della partita rinnovando il TTL. Struttura minima:
 *   { order: string[], index: number, score: number, updatedAt: number }
 * `order` sono i nomi degli stati nell'ordine mescolato scelto a inizio partita.
 */
export function saveSession({ order, index, score }) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ order, index, score, updatedAt: Date.now() })
    );
  } catch {
    // localStorage non disponibile: ignoriamo
  }
}

/** Rimuove la sessione salvata. */
export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignoriamo
  }
}
