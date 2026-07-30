// Logica di riconoscimento della risposta con tolleranza sugli errori di battitura.
//
// Strategia (tolleranza "media" + anti-ambiguità):
//  1. normalizziamo input e risposta (minuscole, niente accenti, niente punteggiatura);
//  2. se coincidono esattamente -> corretto;
//  3. altrimenti calcoliamo la distanza di Levenshtein e la confrontiamo con una soglia
//     proporzionale alla lunghezza del nome;
//  4. anti-ambiguità: se un'altra capitale nel dataset è ALTRETTANTO o PIÙ vicina
//     all'input, la risposta è ambigua e viene rifiutata (es. "Budapest" non passa
//     come "Bucarest" perché Budapest esiste come capitale di un altro stato).

/**
 * Normalizza una stringa: minuscolo, senza accenti/diacritici, senza punteggiatura,
 * spazi collassati. Es. "Bogotá!" -> "bogota".
 */
export function normalize(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Distanza di Levenshtein (edit distance) con due righe. */
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
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** Soglia di errori tollerati in base alla lunghezza del nome normalizzato. */
function allowedErrors(length) {
  if (length <= 3) return 0;
  if (length <= 6) return 1;
  return 2;
}

/**
 * Verifica se `input` è una risposta accettabile per una delle stringhe accettate.
 *
 * @param {string} input - testo digitato
 * @param {string[]} accepted - risposte accettate (nome + eventuali alias)
 * @param {string[]} distractors - altre capitali del dataset da non confondere
 * @returns {{correct: boolean, exact: boolean}}
 */
export function checkAnswer(input, accepted, distractors = []) {
  const guess = normalize(input);
  if (!guess) return { correct: false, exact: false };

  const acceptedNorm = accepted.map(normalize).filter(Boolean);
  const distractorsNorm = distractors.map(normalize).filter(Boolean);

  // Distanza minima verso una risposta accettata.
  let bestAccepted = Infinity;
  for (const a of acceptedNorm) {
    const d = levenshtein(guess, a);
    if (d < bestAccepted) bestAccepted = d;
    if (bestAccepted === 0) break;
  }

  // Match esatto: sempre valido.
  if (bestAccepted === 0) return { correct: true, exact: true };

  // Soglia sulla capitale attesa più lunga (per essere generosi con nomi lunghi).
  const maxLen = Math.max(...acceptedNorm.map((s) => s.length));
  const allowed = allowedErrors(maxLen);
  if (bestAccepted > allowed) return { correct: false, exact: false };

  // Anti-ambiguità: se un distractor è ugualmente o più vicino, rifiuto.
  for (const d of distractorsNorm) {
    const dd = levenshtein(guess, d);
    if (dd <= bestAccepted) return { correct: false, exact: false };
  }

  return { correct: true, exact: false };
}
