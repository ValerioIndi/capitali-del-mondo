// Logica di riconoscimento della risposta con tolleranza sugli errori di battitura.
//
// Strategia (tolleranza "media"):
//  1. normalizziamo input e risposta (minuscole, niente accenti, niente punteggiatura);
//  2. se coincidono esattamente -> corretto;
//  3. altrimenti calcoliamo la distanza di Levenshtein e la confrontiamo con una soglia
//     proporzionale alla lunghezza del nome: nomi lunghi perdonano più errori.

/**
 * Normalizza una stringa: minuscolo, senza accenti/diacritici, senza punteggiatura,
 * spazi collassati. Es. "Bogotá!" -> "bogota".
 */
export function normalize(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .normalize("NFD") // decompone i caratteri accentati (é -> e + accento)
    .replace(/\p{Diacritic}/gu, "") // rimuove i segni diacritici
    .replace(/[^a-z0-9\s]/g, " ") // punteggiatura/apostrofi/trattini -> spazio
    .replace(/\s+/g, " ") // spazi multipli -> uno solo
    .trim();
}

/**
 * Distanza di Levenshtein (numero minimo di inserimenti/cancellazioni/sostituzioni
 * per trasformare a in b). Implementazione con due righe per efficienza.
 */
export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1, // inserimento
        prev[j] + 1, // cancellazione
        prev[j - 1] + cost // sostituzione
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/**
 * Soglia di errori tollerati in base alla lunghezza del nome normalizzato.
 * Nomi corti devono essere quasi esatti; nomi lunghi perdonano fino a 2 errori.
 */
function allowedErrors(length) {
  if (length <= 3) return 0;
  if (length <= 7) return 1;
  return 2;
}

/**
 * Verifica se la risposta dell'utente è accettabile per una data voce del quiz.
 * Confronta con la capitale e con eventuali nomi alternativi (aliases).
 *
 * @param {string} input - testo digitato dall'utente
 * @param {{capital: string, aliases?: string[]}} entry - voce del quiz
 * @returns {{correct: boolean, exact: boolean}}
 */
export function checkAnswer(input, entry) {
  const guess = normalize(input);
  if (!guess) return { correct: false, exact: false };

  const candidates = [entry.capital, ...(entry.aliases || [])].map(normalize);

  let best = Infinity;
  let exact = false;
  for (const cand of candidates) {
    if (!cand) continue;
    const d = levenshtein(guess, cand);
    if (d === 0) exact = true;
    if (d < best) best = d;
    // la soglia dipende dalla lunghezza del candidato corretto
    if (d <= allowedErrors(cand.length)) {
      return { correct: true, exact };
    }
  }
  return { correct: false, exact };
}
