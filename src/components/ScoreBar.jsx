import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

/**
 * Barra in alto durante il gioco: avanzamento domande + punteggio corrente.
 */
export default function ScoreBar({ questionNumber, total, score }) {
  const progress = total > 0 ? (questionNumber / total) * 100 : 0;

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">
          Domanda {questionNumber} / {total}
        </span>
        <span className="inline-flex items-center gap-1 font-bold text-primary">
          <Star className="size-4 fill-primary" />
          {score} punti
        </span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
