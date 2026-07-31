import { Star, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatMs } from "@/utils/time";

/**
 * Barra in alto durante il gioco: avanzamento domande, punteggio corrente
 * e cronometro (mm:ss).
 */
export default function ScoreBar({ questionNumber, total, score, timeMs }) {
  const progress = total > 0 ? (questionNumber / total) * 100 : 0;

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-muted-foreground">
          Domanda {questionNumber} / {total}
        </span>
        <div className="flex items-center gap-3">
          {Number.isFinite(timeMs) && (
            <span className="inline-flex items-center gap-1 font-mono text-muted-foreground tabular-nums">
              <Clock className="size-4" />
              {formatMs(timeMs)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-bold text-primary">
            <Star className="size-4 fill-primary" />
            {score}
          </span>
        </div>
      </div>
      <Progress value={progress} />
    </div>
  );
}
