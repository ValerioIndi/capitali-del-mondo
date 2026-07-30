import { useState } from "react";

// Converte una stringa emoji nei suoi code point in esadecimale, uniti da "-".
// I selettori di variazione (️) e lo zero-width joiner vanno rimossi per
// combaciare con i nomi file di Twemoji.
function toTwemojiName(emoji) {
  const cps = [];
  for (const ch of emoji) {
    const cp = ch.codePointAt(0);
    if (cp === 0xfe0f) continue;
    cps.push(cp.toString(16));
  }
  return cps.join("-");
}

// Bandiera renderizzata come SVG di Twemoji, così è visibile su TUTTI i sistemi
// (Windows non supporta le bandiere emoji nativamente). Se il file non esiste
// o il caricamento fallisce, torniamo al 🏴 come segnaposto.
export default function Flag({ emoji, className = "", alt = "" }) {
  const [failed, setFailed] = useState(false);
  const name = toTwemojiName(emoji || "🏴");
  const url = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/${name}.svg`;
  const fallbackUrl = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/1f3f4.svg`;

  return (
    <img
      src={failed ? fallbackUrl : url}
      onError={() => setFailed(true)}
      alt={alt}
      draggable={false}
      className={className}
      decoding="async"
    />
  );
}
