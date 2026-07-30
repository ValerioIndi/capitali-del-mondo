import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, LogOut, Trophy } from "lucide-react";

import { capitals } from "@/data/capitals";
import StartScreen from "@/components/StartScreen";
import QuestionCard from "@/components/QuestionCard";
import ResultScreen from "@/components/ResultScreen";
import ScoreBar from "@/components/ScoreBar";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadSession, saveSession, clearSession } from "@/utils/session";
import { getBest, getHistory } from "@/utils/storage";

const POINTS_PER_CAPITAL = 3;

/** Mescola una copia dell'array (Fisher-Yates). */
function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const byName = new Map(capitals.map((c) => [c.country, c]));
function questionsFromNames(order) {
  return order.map((n) => byName.get(n)).filter(Boolean);
}

function capitalCount(entry) {
  return entry.capitals ? entry.capitals.length : 1;
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

export default function App() {
  const [phase, setPhase] = useState("start"); // start | playing | result
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [savedSession, setSavedSession] = useState(() => loadSession());
  const [showRestart, setShowRestart] = useState(false);
  const [showRecord, setShowRecord] = useState(false);

  const total = questions.length;
  const maxScore = useMemo(
    () => questions.reduce((s, q) => s + POINTS_PER_CAPITAL * capitalCount(q), 0),
    [questions]
  );
  const current = questions[index];

  // Salva la sessione ad ogni cambio di domanda/punteggio, se stiamo giocando.
  useEffect(() => {
    if (phase !== "playing" || questions.length === 0) return;
    saveSession({
      order: questions.map((q) => q.country),
      index,
      score,
    });
  }, [phase, questions, index, score]);

  const startGame = () => {
    const list = shuffle(capitals);
    setQuestions(list);
    setIndex(0);
    setScore(0);
    setSavedSession(null);
    setPhase("playing");
  };

  const resumeGame = () => {
    if (!savedSession) return;
    const list = questionsFromNames(savedSession.order);
    if (list.length === 0) {
      startGame();
      return;
    }
    setQuestions(list);
    setIndex(Math.min(savedSession.index, list.length - 1));
    setScore(savedSession.score || 0);
    setPhase("playing");
  };

  const handleNext = (earnedPoints) => {
    const newScore = score + earnedPoints;
    setScore(newScore);
    if (index + 1 >= total) {
      clearSession();
      setSavedSession(null);
      setPhase("result");
    } else {
      setIndex(index + 1);
    }
  };

  // "Esci e riprendi quando vuoi": salva e torna alla schermata iniziale.
  const exitGame = () => {
    saveSession({
      order: questions.map((q) => q.country),
      index,
      score,
    });
    setSavedSession(loadSession());
    setPhase("start");
  };

  // "Ricomincia": scarta tutto e ricomincia da zero.
  const confirmRestart = () => {
    clearSession();
    setShowRestart(false);
    startGame();
  };

  const year = useMemo(() => new Date().getFullYear(), []);
  const best = getBest();
  const history = getHistory();

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pb-5 pt-3 sm:pt-5">
      <header className="mb-3 flex items-center justify-center gap-2 text-center">
        <span className="text-2xl">🌍</span>
        <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
          Capitali del Mondo
        </h1>
      </header>

      {phase === "playing" && (
        <ScoreBar questionNumber={index + 1} total={total} score={score} />
      )}

      {/* IMPORTANTE: quando si gioca il contenuto sta IN ALTO (non centrato),
          così la tastiera dell'iPhone non copre la casella di risposta. */}
      <main
        className={
          phase === "playing"
            ? "flex flex-1 flex-col"
            : "flex flex-1 flex-col justify-center"
        }
      >
        {phase === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StartScreen
              totalCountries={capitals.length}
              hasSavedSession={Boolean(savedSession)}
              onStart={startGame}
              onResume={resumeGame}
              onOpenRecord={() => setShowRecord(true)}
            />
          </motion.div>
        )}

        {phase === "playing" && current && (
          <>
            <motion.div
              key={`q-${index}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <QuestionCard entry={current} onNext={handleNext} />
            </motion.div>

            <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={exitGame}
                className="text-muted-foreground"
              >
                <LogOut />
                Esci (riprendi quando vuoi)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRestart(true)}
                className="text-muted-foreground"
              >
                <RotateCcw />
                Ricomincia
              </Button>
            </div>
          </>
        )}

        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ResultScreen
              score={score}
              maxScore={maxScore}
              onRestart={startGame}
            />
          </motion.div>
        )}
      </main>

      <footer className="mt-6 text-center text-xs text-muted-foreground">
        {year} · Quiz sulle capitali · fatto con ❤️
      </footer>

      {/* Modale: conferma ricomincia */}
      <Modal
        open={showRestart}
        onClose={() => setShowRestart(false)}
        title="Ricominciare da capo?"
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Sei sicuro di voler perdere tutto e ricominciare?
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowRestart(false)}
          >
            No
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={confirmRestart}
          >
            Sì, ricomincia
          </Button>
        </div>
      </Modal>

      {/* Modale: il mio record */}
      <Modal
        open={showRecord}
        onClose={() => setShowRecord(false)}
        title="Il tuo record"
      >
        {best ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-amber-500/10 p-4 text-center">
              <Trophy className="mx-auto mb-1 size-6 text-amber-400" />
              <div className="text-3xl font-extrabold text-amber-300">
                {best.score}/{best.max}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round((best.ratio || 0) * 100)}% · {formatDate(best.date)}
              </div>
            </div>
            {history && history.length > 1 && (
              <div>
                <p className="mb-1 text-xs font-semibold text-muted-foreground">
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
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-center text-[11px] text-muted-foreground">
              Il record resta salvato anche quando la sessione scade.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Non hai ancora giocato una partita completa.
          </p>
        )}
      </Modal>
    </div>
  );
}
