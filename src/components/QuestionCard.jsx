import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Lightbulb } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { checkAnswer } from "@/utils/matching";

const MAX_HINTS = 2; // massimo lettere iniziali rivelate prima di mostrare la risposta

/**
 * Costruisce la stringa-indizio della capitale: rivela le prime `revealed`
 * lettere, il resto come "_". Spazi e punteggiatura restano visibili.
 * Es. "Reykjavik" con revealed=2 -> "R e _ _ _ _ _ _ _"
 */
function maskCapital(capital, revealed) {
  let shown = 0;
  return capital
    .split("")
    .map((ch) => {
      if (/\s/.test(ch)) return " ";
      if (!/[a-zàâäçéèêëîïôöûüùÿñæœáíóúü]/i.test(ch)) return ch; // punteggiatura visibile
      if (shown < revealed) {
        shown++;
        return ch;
      }
      return "_";
    })
    .join(" ");
}

export default function QuestionCard({ entry, onNext }) {
  const [value, setValue] = useState("");
  const [hints, setHints] = useState(0); // lettere iniziali rivelate finora
  const [resolved, setResolved] = useState(null); // null | { correct, points }
  const [shake, setShake] = useState(0);
  const inputRef = useRef(null);

  // rimette il focus sull'input ad ogni nuova domanda
  useEffect(() => {
    inputRef.current?.focus();
  }, [entry]);

  const submit = () => {
    if (resolved) {
      onNext(resolved.points);
      return;
    }
    if (!value.trim()) return;

    const { correct } = checkAnswer(value, entry);

    if (correct) {
      const points = 3 - hints; // 0 aiuti->3, 1->2, 2->1
      setResolved({ correct: true, points });
    } else if (hints < MAX_HINTS) {
      setHints(hints + 1);
      setShake((s) => s + 1); // ritrigger animazione
    } else {
      setResolved({ correct: false, points: 0 });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const showHint = hints > 0 && !resolved;

  return (
    <Card className="animate-pop-in overflow-hidden">
      <CardContent className="space-y-5 p-6">
        {/* Bandiera + domanda */}
        <div className="text-center">
          <div className="mb-2 text-6xl leading-none drop-shadow-sm sm:text-7xl">
            {entry.flag}
          </div>
          <p className="text-sm text-muted-foreground">
            Qual è la capitale di
          </p>
          <p className="text-2xl font-extrabold tracking-tight">
            {entry.country}?
          </p>
        </div>

        {/* Indizio con le lettere iniziali */}
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-amber-300"
          >
            <Lightbulb className="size-4 shrink-0" />
            <span className="font-mono text-lg tracking-widest">
              {maskCapital(entry.capital, hints)}
            </span>
          </motion.div>
        )}

        {/* Input risposta */}
        {!resolved && (
          <motion.div key={shake} animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}>
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi la capitale…"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="La tua risposta"
            />
            {hints > 0 && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {hints < MAX_HINTS
                  ? `Non è corretta. Ecco un aiuto — vale ${3 - hints} ${
                      3 - hints === 1 ? "punto" : "punti"
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
              resolved.correct
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-destructive/15 text-red-300"
            }`}
          >
            <div className="mb-1 flex items-center justify-center gap-2 font-bold">
              {resolved.correct ? (
                <>
                  <Check className="size-5" /> Esatto!
                </>
              ) : (
                <>
                  <X className="size-5" /> Peccato!
                </>
              )}
            </div>
            <p className="text-sm text-foreground">
              La capitale è <span className="font-bold">{entry.capital}</span>
            </p>
            <Badge
              variant={resolved.correct ? "success" : "destructive"}
              className="mt-2"
            >
              +{resolved.points} {resolved.points === 1 ? "punto" : "punti"}
            </Badge>
          </motion.div>
        )}

        {/* Pulsante azione */}
        <Button className="w-full" size="lg" onClick={submit}>
          {resolved ? (
            <>
              Prossima <ArrowRight />
            </>
          ) : (
            "Rispondi"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
