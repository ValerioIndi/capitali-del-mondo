import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Trophy, Sparkles, Clock } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveResult, getBest, getHistory } from "@/utils/storage";
import { formatMs } from "@/utils/time";

function messaggio(ratio) {
  if (ratio >= 0.9) return "Fenomenale! Sei un vero geografo. 🌟";
  if (ratio >= 0.7) return "Ottimo lavoro, ci sai fare! 👏";
  if (ratio >= 0.5) return "Niente male, ma puoi migliorare. 💪";
  if (ratio >= 0.3) return "C'è del potenziale, riprova! 🗺️";
  return "Ripassiamo un po' di capitali? 📚";
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
}

export default function ResultScreen({ score, maxScore, timeMs, onRestart }) {
  const ratio = maxScore > 0 ? score / maxScore : 0;
  const percent = Math.round(ratio * 100);

  // Salviamo il risultato una sola volta (guardia per lo StrictMode in sviluppo).
  const savedRef = useRef(false);
  const [isRecord, setIsRecord] = useState(false);
  const [best, setBest] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;
    const record = saveResult(score, maxScore, timeMs);
    setIsRecord(record);
    setBest(getBest());
    setHistory(getHistory());
  }, [score, maxScore, timeMs]);

  return (
    <Card className="animate-pop-in">
      <CardHeader className="text-center">
        <div className="mx-auto mb-1 text-5xl">
          {ratio >= 0.7 ? "🏆" : ratio >= 0.4 ? "🎯" : "🌍"}
        </div>
        <CardTitle className="text-2xl">Partita finita!</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Punteggio grande */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="text-5xl font-extrabold"
          >
            <span className="text-primary">{score}</span>
            <span className="text-muted-foreground"> / {maxScore}</span>
          </motion.div>
          <p className="mt-1 text-sm text-muted-foreground">
            {percent}% del punteggio massimo
          </p>
          {Number.isFinite(timeMs) && (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1 text-sm font-mono tabular-nums">
              <Clock className="size-4" />
              {formatMs(timeMs)}
            </p>
          )}
        </div>

        {isRecord && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 rounded-lg bg-amber-500/15 px-3 py-2 font-bold text-amber-300"
          >
            <Sparkles className="size-4" />
            Nuovo record personale!
          </motion.div>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {messaggio(ratio)}
        </p>

        {best && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <Trophy className="size-4 text-amber-400" />
            <span className="text-muted-foreground">
              Record:{" "}
              <span className="font-bold text-foreground">
                {best.score}/{best.max}
              </span>
              {Number.isFinite(best.timeMs) && (
                <span className="ml-1 font-mono tabular-nums text-foreground">
                  ({formatMs(best.timeMs)})
                </span>
              )}
            </span>
          </div>
        )}

        {history.length > 1 && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">
              Partite recenti
            </p>
            <div className="space-y-1">
              {history.slice(0, 5).map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md bg-secondary/40 px-3 py-1.5 text-sm"
                >
                  <span className="text-muted-foreground">
                    {formatDate(h.date)}
                  </span>
                  <span className="font-medium">
                    {h.score}/{h.max}
                    {Number.isFinite(h.timeMs) && (
                      <span className="ml-2 text-xs font-mono tabular-nums text-muted-foreground">
                        {formatMs(h.timeMs)}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button size="lg" className="w-full" onClick={onRestart}>
          <RotateCcw />
          Rigioca
        </Button>
      </CardContent>
    </Card>
  );
}
