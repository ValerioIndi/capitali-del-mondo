import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Lightbulb, Globe, HelpCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Flag from "@/components/Flag";
import { checkAnswer } from "@/utils/matching";
import { allCapitalNames } from "@/data/capitals";

const MAX_HINTS = 2; // massimo lettere iniziali rivelate per capitale
const POINTS = 3; // punti pieni per capitale (senza aiuti)

/** Prima lettera maiuscola (senza toccare il resto). */
function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Costruisce la stringa-indizio di una capitale: rivela le prime `revealed`
 * lettere, il resto come "_". Spazi e punteggiatura restano visibili.
 */
function maskCapital(name, revealed) {
  let shown = 0;
  return name
    .split("")
    .map((ch) => {
      if (/\s/.test(ch)) return " ";
      if (!/[a-zàâäçéèêëîïôöûüùÿñæœáíóúü]/i.test(ch)) return ch;
      if (shown < revealed) {
        shown++;
        return ch;
      }
      return "_";
    })
    .join(" ");
}

// Normalizza la definizione delle capitali di un entry come array di { name, aliases }.
function getSlots(entry) {
  if (entry.capitals) return entry.capitals;
  return [{ name: entry.capital, aliases: entry.aliases }];
}

export default function QuestionCard({ entry, onNext }) {
  const slots = useMemo(() => getSlots(entry), [entry]);
  const total = slots.length;
  const multi = total > 1;

  // Nomi da usare come "distractors" per l'anti-ambiguità: tutte le capitali
  // del dataset TRANNE quelle di questo stato (e i loro alias).
  const distractors = useMemo(() => {
    const own = new Set();
    for (const s of slots) {
      own.add(s.name);
      for (const a of s.aliases || []) own.add(a);
    }
    return allCapitalNames.filter((n) => !own.has(n));
  }, [slots]);

  const [solved, setSolved] = useState(() => Array(total).fill(false));
  const [points, setPoints] = useState(() => Array(total).fill(0));
  const [hint, setHint] = useState(() => Array(total).fill(0));
  const [boxes, setBoxes] = useState(() => Array(total).fill(""));
  const [resolved, setResolved] = useState(false);
  const [shake, setShake] = useState(0);
  const firstInputRef = useRef(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, [entry]);

  const totalPoints = points.reduce((a, b) => a + b, 0);
  const maxPoints = total * POINTS;

  // Auto-avanzamento: quando la domanda è risolta, dopo 1s passa alla prossima.
  // L'utente può comunque cliccare "Prossima" per andare avanti prima.
  useEffect(() => {
    if (!resolved) return;
    const t = setTimeout(() => onNext(totalPoints), 850);
    return () => clearTimeout(t);
  }, [resolved, onNext, totalPoints]);

  const finish = (nextSolved = solved, nextPoints = points) => {
    setSolved(nextSolved);
    setPoints(nextPoints);
    setResolved(true);
    setBoxes([]);
  };

  const submit = () => {
    if (resolved) {
      onNext(totalPoints);
      return;
    }

    const texts = boxes.map((b) => b.trim()).filter(Boolean);
    if (texts.length === 0) return;

    // Abbinamento indipendente dall'ordine.
    const nextSolved = [...solved];
    const nextPoints = [...points];
    let newlySolved = 0;
    for (const text of texts) {
      for (let j = 0; j < total; j++) {
        if (nextSolved[j]) continue;
        const accepted = [slots[j].name, ...(slots[j].aliases || [])];
        // Distractors = altre capitali del mondo + le altre capitali di questo stato
        // già/ancora non risolte (per non confondere Amsterdam con L'Aia, ecc.)
        const localDistractors = distractors.concat(
          slots
            .filter((_, k) => k !== j)
            .flatMap((s) => [s.name, ...(s.aliases || [])])
        );
        const ok = checkAnswer(text, accepted, localDistractors).correct;
        if (ok) {
          nextSolved[j] = true;
          nextPoints[j] = POINTS - hint[j];
          newlySolved++;
          break;
        }
      }
    }

    const stillUnsolved = nextSolved
      .map((s, i) => (s ? -1 : i))
      .filter((i) => i >= 0);

    if (stillUnsolved.length === 0) {
      finish(nextSolved, nextPoints);
      return;
    }

    if (newlySolved > 0) {
      // Progresso parziale: registra i risolti, resetta le caselle
      setSolved(nextSolved);
      setPoints(nextPoints);
      setBoxes(Array(stillUnsolved.length).fill(""));
      firstInputRef.current?.focus();
      return;
    }

    // Nessun progresso -> errore: aggiungi un indizio sulla capitale con MENO
    // lettere svelate (a caso in caso di parità). Se sono tutte al massimo, finisce.
    const hintable = stillUnsolved.filter((j) => hint[j] < MAX_HINTS);
    if (hintable.length === 0) {
      finish(nextSolved, nextPoints);
      return;
    }
    const minHint = Math.min(...hintable.map((j) => hint[j]));
    const pool = hintable.filter((j) => hint[j] === minHint);
    const target = pool[Math.floor(Math.random() * pool.length)];
    const nextHint = [...hint];
    nextHint[target]++;
    setHint(nextHint);
    setShake((s) => s + 1);
    // Cancella l'input dopo un tentativo sbagliato (richiesta esplicita)
    setBoxes(Array(stillUnsolved.length).fill(""));
    firstInputRef.current?.focus();
  };

  const giveUp = () => finish();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const setBox = (i, val) => {
    const forced = capitalizeFirst(val);
    setBoxes((prev) => prev.map((b, idx) => (idx === i ? forced : b)));
  };

  const unsolvedIdxs = solved
    .map((s, i) => (s ? -1 : i))
    .filter((i) => i >= 0);
  const clues = unsolvedIdxs
    .filter((j) => hint[j] > 0)
    .map((j) => maskCapital(slots[j].name, hint[j]));

  const allSolved = solved.every(Boolean);
  const noneSolved = solved.every((s) => !s);

  return (
    <Card className="animate-pop-in overflow-hidden">
      <CardContent className="space-y-4 p-5 sm:space-y-5 sm:p-6">
        {/* Messaggio speciale (es. Palestina) */}
        {entry.specialMessage && (
          <div className="rounded-lg bg-red-500/15 px-3 py-2 text-center text-sm font-bold text-red-300">
            {entry.specialMessage}
          </div>
        )}

        {/* Bandiera + continente + domanda */}
        <div className="text-center">
          <div className="mx-auto mb-2 flex justify-center">
            <Flag
              emoji={entry.flag}
              alt={entry.country}
              className="h-16 w-auto object-contain drop-shadow-md sm:h-20"
            />
          </div>
          {entry.continent && (
            <div className="mb-2 flex justify-center">
              <Badge variant="secondary" className="gap-1">
                <Globe className="size-3.5" />
                {entry.continent}
              </Badge>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {multi ? "Quali sono le capitali di" : "Qual è la capitale di"}
          </p>
          <p className="text-2xl font-extrabold tracking-tight">
            {entry.country}?
          </p>
          {multi && !resolved && (
            <p className="mt-1 text-xs font-medium text-primary">
              Ne ha {total}: indovinale tutte ({POINTS} punti ciascuna)
            </p>
          )}
        </div>

        {/* Capitali già indovinate (chip) */}
        {multi && !resolved && solved.some(Boolean) && (
          <div className="flex flex-wrap justify-center gap-2">
            {slots.map((slot, i) =>
              solved[i] ? (
                <Badge key={i} variant="success" className="gap-1">
                  <Check className="size-3.5" />
                  {slot.name} +{points[i]}
                </Badge>
              ) : null
            )}
          </div>
        )}

        {/* Indizi con le lettere iniziali */}
        {clues.length > 0 && !resolved && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1 rounded-lg bg-amber-500/10 px-3 py-2 text-amber-300"
          >
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Lightbulb className="size-3.5" />
              {multi ? "Iniziali svelate:" : "Aiuto:"}
            </div>
            {clues.map((c, i) => (
              <div
                key={i}
                className="text-center font-mono text-lg tracking-widest"
              >
                {c}
              </div>
            ))}
          </motion.div>
        )}

        {/* Caselle di risposta */}
        {!resolved && (
          <motion.div
            key={shake}
            animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
            className="space-y-2"
          >
            {boxes.map((val, i) => (
              <Input
                key={i}
                ref={i === 0 ? firstInputRef : undefined}
                value={val}
                onChange={(e) => setBox(i, e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={multi ? `Capitale ${i + 1}…` : "Scrivi la capitale…"}
                autoComplete="off"
                autoCapitalize="sentences"
                autoCorrect="off"
                spellCheck={false}
                aria-label={`Risposta ${i + 1}`}
              />
            ))}
            {!multi && hint[0] > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                {hint[0] < MAX_HINTS
                  ? `Non era corretta. Ecco un aiuto — vale ${POINTS - hint[0]} ${
                      POINTS - hint[0] === 1 ? "punto" : "punti"
                    } se indovini ora.`
                  : `Ultimo tentativo — vale 1 punto se indovini.`}
              </p>
            )}
          </motion.div>
        )}

        {/* Esito */}
        {resolved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-lg p-4 text-center ${
              allSolved
                ? "bg-emerald-500/15 text-emerald-300"
                : noneSolved
                  ? "bg-destructive/15 text-red-300"
                  : "bg-amber-500/15 text-amber-300"
            }`}
          >
            <div className="mb-2 flex items-center justify-center gap-2 font-bold">
              {allSolved ? (
                <>
                  <Check className="size-5" /> {multi ? "Tutte giuste!" : "Esatto!"}
                </>
              ) : noneSolved ? (
                <>
                  <X className="size-5" /> Peccato!
                </>
              ) : (
                <>
                  <Check className="size-5" /> Quasi!
                </>
              )}
            </div>
            <div className="space-y-1.5">
              {slots.map((slot, i) =>
                solved[i] ? (
                  <div
                    key={i}
                    className="flex items-center justify-center gap-2 text-sm text-foreground"
                  >
                    <Check className="size-4 text-emerald-400" />
                    <span className="font-semibold">{slot.name}</span>
                    <span className="text-emerald-400">+{points[i]}</span>
                  </div>
                ) : (
                  // Capitale NON indovinata: più grande, in rosso, ben evidente,
                  // così nel tempo prima della prossima domanda si riesce a
                  // memorizzarla.
                  <div
                    key={i}
                    className="flex items-center justify-center gap-2 rounded-md bg-red-500/10 px-2 py-1 text-lg font-extrabold text-red-400 sm:text-xl"
                  >
                    <X className="size-5 shrink-0" />
                    <span>{slot.name}</span>
                  </div>
                )
              )}
            </div>
            <Badge
              variant={allSolved ? "success" : noneSolved ? "destructive" : "default"}
              className="mt-3"
            >
              +{totalPoints} / {maxPoints} punti
            </Badge>
          </motion.div>
        )}

        {/* Pulsanti azione */}
        <div className="space-y-2">
          <Button className="w-full" size="xl" onClick={submit}>
            {resolved ? (
              <>
                Prossima <ArrowRight />
              </>
            ) : (
              "Rispondi"
            )}
          </Button>
          {!resolved && (
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={giveUp}
            >
              <HelpCircle />
              Non lo so, mostra {multi ? "le risposte" : "la risposta"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
