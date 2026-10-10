
import { useState } from "react";
import { Link } from "react-router-dom";
import { countries } from "./data/countries";

const QUESTIONS_PER_QUIZ = 5;

function createQuestions() {
  const shuffledCountries = [...countries].sort(
    () => Math.random() - 0.5
  );

  return shuffledCountries
    .slice(0, Math.min(QUESTIONS_PER_QUIZ, countries.length))
    .map((country) => {
      const otherCountries = countries.filter(
        (item) => item.id !== country.id
      );

      const wrongAnswers = [...otherCountries]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [country, ...wrongAnswers].sort(
        () => Math.random() - 0.5
      );

      return {
        country,
        options,
      };
    });
}

function QuizPage() {
  const [questions, setQuestions] = useState(createQuestions);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [finished, setFinished] = useState(false);

  const question = questions[currentQuestion];

  function handleAnswer(countryId) {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(countryId);

    if (countryId === question.country.id) {
      setScore((previousScore) => previousScore + 1);
    }
  }

  function handleNext() {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((previous) => previous + 1);
      setSelectedAnswer(null);
    } else {
      setFinished(true);
    }
  }

  function playAgain() {
    setQuestions(createQuestions());
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setFinished(false);
  }

  return (
    <main className="quiz-page">
      <Link to="/" className="compare-back">
        ← Back to Home
      </Link>

      <section className="quiz-card">
        <p className="hero-tag">WORLD EXPLORER CHALLENGE</p>

        {!finished ? (
          <>
            <div className="quiz-progress-info">
              <span>
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span>Score: {score}</span>
            </div>

            <div
              className="quiz-progress-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={questions.length}
              aria-valuenow={currentQuestion + 1}
            >
              <div
                className="quiz-progress-fill"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <h1>Guess the Country 🌍</h1>

            <p className="quiz-question">
              Which country does this flag belong to?
            </p>

            <div className="quiz-flag">
              {question.country.flag}
            </div>

            <div className="quiz-options">
              {question.options.map((option) => {
                const isCorrect =
                  option.id === question.country.id;

                const isSelected =
                  selectedAnswer === option.id;

                let className = "quiz-option";

                if (selectedAnswer !== null && isCorrect) {
                  className += " correct";
                } else if (isSelected && !isCorrect) {
                  className += " incorrect";
                }

                return (
                  <button
                    type="button"
                    key={option.id}
                    className={className}
                    onClick={() => handleAnswer(option.id)}
                    disabled={selectedAnswer !== null}
                  >
                    {option.name}
                    {selectedAnswer !== null && isCorrect
                      ? " ✓"
                      : ""}
                    {isSelected && !isCorrect ? " ✕" : ""}
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <div className="quiz-feedback" aria-live="polite">
                <p>
                  {selectedAnswer === question.country.id
                    ? "Correct answer! 🎉"
                    : `Not quite! The correct answer is ${question.country.name}.`}
                </p>

                <button
                  type="button"
                  className="quiz-primary-button"
                  onClick={handleNext}
                >
                  {currentQuestion + 1 === questions.length
                    ? "See Results"
                    : "Next Question →"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="quiz-results">
            <div className="quiz-trophy">🏆</div>
            <h1>Quiz Completed!</h1>
            <p className="subtitle">
              Great job exploring the world.
            </p>

            <div className="quiz-score-circle">
              <strong>
                {Math.round((score / questions.length) * 100)}%
              </strong>
              <span>{score} / {questions.length} correct</span>
            </div>

            <p className="quiz-result-message">
              {score === questions.length
                ? "Perfect score! You're a geography star! 🌟"
                : score >= Math.ceil(questions.length / 2)
                  ? "Well done! Keep learning about our world. 🌍"
                  : "Good effort! Play again and improve your score. 💪"}
            </p>

            <button
              type="button"
              className="quiz-primary-button"
              onClick={playAgain}
            >
              Play Again ↻
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default QuizPage;
