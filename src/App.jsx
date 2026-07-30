import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { capitals } from "@/data/capitals";
import StartScreen from "@/components/StartScreen";
import QuestionCard from "@/components/QuestionCard";
import ResultScreen from "@/components/ResultScreen";
import ScoreBar from "@/components/ScoreBar";

// Quante domande per partita. 0 = tutti gli stati (mescolati).
const QUESTIONS_PER_GAME = 0;
const POINTS_PER_QUESTION = 3;

/** Mescola una copia dell'array (Fisher-Yates). */
function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions() {
  const shuffled = shuffle(capitals);
  return QUESTIONS_PER_GAME > 0
    ? shuffled.slice(0, QUESTIONS_PER_GAME)
    : shuffled;
}

export default function App() {
  const [phase, setPhase] = useState("start"); // start | playing | result
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const total = questions.length;
  const maxScore = total * POINTS_PER_QUESTION;
  const current = questions[index];

  const startGame = () => {
    setQuestions(buildQuestions());
    setIndex(0);
    setScore(0);
    setPhase("playing");
  };

  const handleNext = (earnedPoints) => {
    const newScore = score + earnedPoints;
    setScore(newScore);
    if (index + 1 >= total) {
      setPhase("result");
    } else {
      setIndex(index + 1);
    }
  };

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 py-5 sm:py-8">
      <header className="mb-4 flex items-center justify-center gap-2 text-center">
        <span className="text-2xl">🌍</span>
        <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">
          Capitali del Mondo
        </h1>
      </header>

      {phase === "playing" && (
        <ScoreBar
          questionNumber={index + 1}
          total={total}
          score={score}
          maxSoFar={index * POINTS_PER_QUESTION}
        />
      )}

      <main className="flex flex-1 flex-col justify-center">
        {phase === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StartScreen totalCountries={capitals.length} onStart={startGame} />
          </motion.div>
        )}

        {phase === "playing" && current && (
          <motion.div
            key={`q-${index}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <QuestionCard
              entry={current}
              questionNumber={index + 1}
              total={total}
              onNext={handleNext}
            />
          </motion.div>
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
    </div>
  );
}
