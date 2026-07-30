import { Trophy, Play, RotateCcw } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBest } from "@/utils/storage";

function ScoreRule({ points, label }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2">
      <Badge variant="default" className="shrink-0">
        {points} {points === 1 ? "punto" : "punti"}
      </Badge>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export default function StartScreen({
  totalCountries,
  hasSavedSession,
  onStart,
  onResume,
  onOpenRecord,
}) {
  const best = getBest();
  const hasHistory = Boolean(best);

  return (
    <Card className="animate-pop-in">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 text-5xl">🗺️</div>
        <CardTitle className="text-2xl">Quiz sulle Capitali</CardTitle>
        <CardDescription>
          Riconosci la capitale di ogni stato. Sono {totalCountries} nazioni,
          in ordine casuale.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Come funziona il punteggio</p>
          <ScoreRule points={3} label="Rispondi subito, senza aiuti" />
          <ScoreRule points={2} label="Rispondi dopo la 1ª lettera rivelata" />
          <ScoreRule points={1} label="Rispondi dopo le prime 2 lettere" />
          <ScoreRule points={0} label="Non indovini: ti mostro la risposta" />
        </div>

        <p className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-muted-foreground">
          💡 Non serve la grafia perfetta: piccoli errori di battitura e gli
          accenti vengono perdonati (ma niente scorciatoie: nomi troppo simili
          a un'altra capitale sono rifiutati).
        </p>

        <div className="space-y-2 pt-1">
          {hasSavedSession ? (
            <>
              <Button size="xl" className="w-full" onClick={onResume}>
                <Play className="fill-current" />
                Riprendi la partita
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={onStart}
              >
                <RotateCcw />
                Inizia una nuova partita
              </Button>
            </>
          ) : (
            <Button size="xl" className="w-full" onClick={onStart}>
              <Play className="fill-current" />
              Inizia il quiz
            </Button>
          )}

          {hasHistory && (
            <Button
              variant="ghost"
              size="lg"
              className="w-full text-muted-foreground"
              onClick={onOpenRecord}
            >
              <Trophy className="text-amber-400" />
              Il mio record ({best.score}/{best.max})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
