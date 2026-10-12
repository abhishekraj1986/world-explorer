
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { countries as fallbackCountries } from "./data/countries";

const CATEGORY_OPTIONS = [
  { id: "flags", label: "Flags" },
  { id: "capitals", label: "Capitals" },
  { id: "geography", label: "Geography" },
  { id: "populationArea", label: "Population & Area" },
];

const DIFFICULTIES = [
  { id: "Easy", description: "Basic country knowledge" },
  { id: "Medium", description: "Mixed knowledge and comparisons" },
  { id: "Hard", description: "Advanced geography and data reasoning" },
];

const shuffle = (items) => {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const cleanText = (value) => {
  if (Array.isArray(value)) return value[0] || "";
  return typeof value === "string" ? value.trim() : "";
};

const unique = (items) =>
  [...new Set(items.filter((item) => item !== "" && item != null))];

function normalizeCountries(list) {
  return (Array.isArray(list) ? list : [])
    .map((country) => ({
      ...country,
      name: cleanText(country.name),
      capital: cleanText(country.capital),
      region: cleanText(country.region),
      subregion: cleanText(country.subregion),
      population: Number(country.population) || 0,
      area: Number(country.area) || 0,
      flag: country.flag || "",
      flagImage: country.flagImage || "",
    }))
    .filter((country) => country.name);
}

/**
 * The correct answer is explicitly inserted into the options.
 * Three unique distractors are selected from the same answer domain.
 */
function makeQuestion(prompt, answer, possibleAnswers, extra = {}) {
  if (!answer) return null;

  const distractors = shuffle(
    unique(possibleAnswers).filter((item) => item !== answer)
  ).slice(0, 3);

  // Never create a question with fewer than four unique options.
  if (distractors.length !== 3) return null;

  const options = shuffle([answer, ...distractors]);

  return {
    id: extra.id,
    prompt,
    answer,
    options,
    ...extra,
  };
}

function getCountryOptions(list) {
  return unique(list.map((country) => country.name));
}

function createQuestionPool(list, selectedCategories, difficulty) {
  const pool = [];
  const countriesByName = getCountryOptions(list);

  if (list.length < 4) return pool;

  // FLAGS
  if (selectedCategories.includes("flags")) {
    list.forEach((country) => {
      if (!country.flagImage && !country.flag) return;

      const question = makeQuestion(
        "Which country does this flag belong to?",
        country.name,
        countriesByName,
        {
          id: `flag-${country.name}`,
          type: "flag",
          flagImage: country.flagImage,
          flag: country.flag,
          category: "Flags",
        }
      );

      if (question) pool.push(question);
    });
  }

  // CAPITALS
  if (selectedCategories.includes("capitals")) {
    const capitalCountries = list.filter(
      (country) => country.capital
    );

    const capitalOptions = unique(
      capitalCountries.map((country) => country.capital)
    );

    capitalCountries.forEach((country) => {
      const question = makeQuestion(
        `What is the capital of ${country.name}?`,
        country.capital,
        capitalOptions,
        {
          id: `capital-${country.name}`,
          type: "text",
          category: "Capitals",
        }
      );

      if (question) pool.push(question);
    });
  }

  // GEOGRAPHY: region and subregion identification
  if (selectedCategories.includes("geography")) {
    const regionCountries = list.filter((country) => country.region);

    regionCountries.forEach((country) => {
      const question = makeQuestion(
        `Which country belongs to the ${country.region} region?`,
        country.name,
        countriesByName,
        {
          id: `region-${country.name}`,
          type: "text",
          category: "Geography",
        }
      );

      if (question) pool.push(question);
    });

    const subregionCountries = list.filter(
      (country) => country.subregion
    );

    if (difficulty === "Hard") {
      subregionCountries.forEach((country) => {
        const question = makeQuestion(
          `Which country is in ${country.subregion}?`,
          country.name,
          countriesByName,
          {
            id: `subregion-${country.name}`,
            type: "text",
            category: "Geography",
          }
        );

        if (question) pool.push(question);
      });
    }
  }

  // POPULATION AND AREA: four-country comparisons
  if (selectedCategories.includes("populationArea")) {
    const comparisonTypes = [
      {
        key: "population",
        label: "population",
        getValue: (country) => country.population,
      },
      {
        key: "area",
        label: "total area",
        getValue: (country) => country.area,
      },
    ];

    comparisonTypes.forEach(({ key, label, getValue }) => {
      const eligible = list.filter(
        (country) => Number.isFinite(getValue(country)) && getValue(country) > 0
      );

      if (eligible.length < 4) return;

      // Random four-country sets; repeated sets are skipped.
      const seenSets = new Set();
      const maxAttempts = Math.min(eligible.length * 12, 500);

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const group = shuffle(eligible).slice(0, 4);

        if (group.length !== 4) continue;

        const values = group.map(getValue);

        // Ties would make "largest" ambiguous, so skip them.
        if (new Set(values).size !== 4) continue;

        const setKey = group
          .map((country) => country.name)
          .sort()
          .join("|");

        if (seenSets.has(setKey)) continue;
        seenSets.add(setKey);

        const winner = [...group].sort(
          (a, b) => getValue(b) - getValue(a)
        )[0];

        const question = makeQuestion(
          `Which country has the largest ${label} among these four countries?`,
          winner.name,
          group.map((country) => country.name),
          {
            id: `${key}-${setKey}`,
            type: "text",
            category: "Population & Area",
          }
        );

        if (question) pool.push(question);
      }
    });
  }

  return pool;
}

export default function QuizPage({ countries: apiCountries }) {
  const sourceCountries =
    Array.isArray(apiCountries) && apiCountries.length
      ? apiCountries
      : fallbackCountries;

  const countries = useMemo(
    () => normalizeCountries(sourceCountries),
    [sourceCountries]
  );

  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState([
    "flags",
    "capitals",
    "geography",
    "populationArea",
  ]);

  const [quiz, setQuiz] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [notice, setNotice] = useState("");

  const currentQuestion = quiz[currentIndex];
  const progress = quiz.length
    ? ((currentIndex + (answered ? 1 : 0)) / quiz.length) * 100
    : 0;

  function toggleCategory(category) {
    setSelectedCategories((previous) =>
      previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category]
    );
  }

  function startQuiz() {
    if (!selectedCategories.length) {
      setNotice("Please select at least one question category.");
      return;
    }

    const pool = createQuestionPool(
      countries,
      selectedCategories,
      difficulty
    );

    const selectedQuestions = shuffle(pool).slice(
      0,
      Math.max(1, Math.min(30, Number(questionCount) || 10))
    );

    if (!selectedQuestions.length) {
      setNotice(
        "Not enough country data for these categories. Select more categories or load more countries."
      );
      return;
    }

    setNotice(
      selectedQuestions.length < questionCount
        ? `Only ${selectedQuestions.length} unique questions are available with the current data and categories. Add more country data or select more categories for a longer quiz.`
        : ""
    );

    setQuiz(selectedQuestions);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setAnswered(false);
    setFinished(false);
    setStarted(true);
  }

  function selectAnswer(option) {
    if (answered || !currentQuestion) return;

    setSelectedAnswer(option);
    setAnswered(true);

    if (option === currentQuestion.answer) {
      setScore((previous) => previous + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= quiz.length) {
      setFinished(true);
      return;
    }

    setCurrentIndex((previous) => previous + 1);
    setSelectedAnswer("");
    setAnswered(false);
  }

  function resetQuiz() {
    setQuiz([]);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setAnswered(false);
    setFinished(false);
    setStarted(false);
    setNotice("");
  }

  if (!started) {
    return (
      <main className="quiz-page">
        <section className="quiz-card quiz-setup">
          <span className="hero-tag">WORLD EXPLORER</span>
          <h1 className="quiz-question">Build Your Quiz</h1>
          <p className="quiz-setup-description">
            Choose your difficulty, question count and categories.
          </p>

          <div className="quiz-setup-section">
            <h2>Difficulty</h2>
            <div className="quiz-difficulty-options">
              {DIFFICULTIES.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`quiz-difficulty-button ${
                    difficulty === item.id ? "active" : ""
                  }`}
                  onClick={() => setDifficulty(item.id)}
                  aria-pressed={difficulty === item.id}
                >
                  <strong>{item.id}</strong>
                  <span>{item.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-setup-section">
            <label htmlFor="quiz-question-count">
              <h2>Number of questions</h2>
            </label>
            <div className="quiz-count-control">
              <button
                type="button"
                onClick={() =>
                  setQuestionCount((value) => Math.max(5, value - 5))
                }
                disabled={questionCount <= 5}
                aria-label="Decrease question count"
              >
                −
              </button>

              <input
                id="quiz-question-count"
                type="number"
                min="5"
                max="30"
                step="1"
                value={questionCount}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setQuestionCount(
                    event.target.value === ""
                      ? ""
                      : Math.max(5, Math.min(30, value))
                  );
                }}
                onBlur={() => {
                  setQuestionCount((value) =>
                    Math.max(5, Math.min(30, Number(value) || 10))
                  );
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setQuestionCount((value) =>
                    Math.min(30, Number(value || 10) + 5)
                  )
                }
                disabled={Number(questionCount) >= 30}
                aria-label="Increase question count"
              >
                +
              </button>
            </div>
            <p className="quiz-setup-hint">Choose between 5 and 30 questions.</p>
          </div>

          <div className="quiz-setup-section">
            <h2>Question categories</h2>
            <div className="quiz-category-options">
              {CATEGORY_OPTIONS.map((category) => (
                <label
                  className="quiz-category-option"
                  key={category.id}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                  <span>{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {notice && (
            <p className="quiz-setup-notice" role="alert">
              {notice}
            </p>
          )}

          <button
            type="button"
            className="quiz-primary-button"
            onClick={startQuiz}
            disabled={!selectedCategories.length}
          >
            Start Quiz <span aria-hidden="true">→</span>
          </button>

          <Link to="/" className="compare-back">
            ← Back to World Explorer
          </Link>
        </section>
      </main>
    );
  }

  if (finished) {
    const percentage = quiz.length
      ? Math.round((score / quiz.length) * 100)
      : 0;

    return (
      <main className="quiz-page">
        <section className="quiz-card quiz-results">
          <div className="quiz-trophy" aria-hidden="true">
            🏆
          </div>

          <span className="hero-tag">QUIZ COMPLETED</span>
          <h1 className="quiz-question">Amazing exploration!</h1>

          <div className="quiz-score-circle">
            <strong>{percentage}%</strong>
            <span>{score} / {quiz.length} correct</span>
          </div>

          <p className="quiz-result-message">
            {percentage >= 80
              ? "Excellent work! Your world knowledge is strong."
              : percentage >= 50
                ? "Nice effort! Keep exploring and learning."
                : "Good start! Try again to learn more about our world."}
          </p>

          <div className="quiz-result-meta">
            <span>{difficulty} difficulty</span>
            <span>{quiz.length} questions</span>
          </div>

          <button
            type="button"
            className="quiz-primary-button"
            onClick={startQuiz}
          >
            Play Again
          </button>

          <button
            type="button"
            className="quiz-secondary-button"
            onClick={resetQuiz}
          >
            Change Quiz Settings
          </button>

          <Link to="/" className="compare-back">
            ← Back to World Explorer
          </Link>
        </section>
      </main>
    );
  }

  if (!currentQuestion) return null;

  return (
    <main className="quiz-page">
      <section className="quiz-card">
        <div className="quiz-topline">
          <span className="hero-tag">{difficulty.toUpperCase()} MODE</span>
          <span className="quiz-progress-info">
            Question {currentIndex + 1} of {quiz.length}
          </span>
        </div>

        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="quiz-question-meta">
          <span>{currentQuestion.category}</span>
          <span>Score: {score}</span>
        </div>

        <h1 className="quiz-question">{currentQuestion.prompt}</h1>

        {currentQuestion.type === "flag" && (
          <div className="quiz-flag">
            {currentQuestion.flagImage ? (
              <img
                src={currentQuestion.flagImage}
                alt="Flag to identify"
                loading="lazy"
              />
            ) : (
              <span aria-label="Flag">{currentQuestion.flag}</span>
            )}
          </div>
        )}

        <div className="quiz-options">
          {currentQuestion.options.map((option) => {
            let stateClass = "";

            if (answered && option === currentQuestion.answer) {
              stateClass = "correct";
            } else if (answered && option === selectedAnswer) {
              stateClass = "incorrect";
            }

            return (
              <button
                type="button"
                key={option}
                className={`quiz-option ${stateClass}`}
                onClick={() => selectAnswer(option)}
                disabled={answered}
              >
                <span>{option}</span>

                {answered && option === currentQuestion.answer && (
                  <span aria-label="Correct answer">✓</span>
                )}

                {answered &&
                  option === selectedAnswer &&
                  option !== currentQuestion.answer && (
                    <span aria-label="Incorrect answer">×</span>
                  )}
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={`quiz-feedback ${
              selectedAnswer === currentQuestion.answer
                ? "correct"
                : "incorrect"
            }`}
            role="status"
          >
            <strong>
              {selectedAnswer === currentQuestion.answer
                ? "Correct!"
                : "Not quite!"}
            </strong>
            <p>
              {selectedAnswer === currentQuestion.answer
                ? `Great job! The answer is ${currentQuestion.answer}.`
                : `The correct answer is ${currentQuestion.answer}.`}
            </p>
          </div>
        )}

        {notice && (
          <p className="quiz-setup-notice" role="status">
            {notice}
          </p>
        )}

        {answered && (
          <button
            type="button"
            className="quiz-primary-button"
            onClick={nextQuestion}
          >
            {currentIndex + 1 === quiz.length
              ? "See Results"
              : "Next Question"}{" "}
            <span aria-hidden="true">→</span>
          </button>
        )}

        <button
          type="button"
          className="quiz-exit-button"
          onClick={resetQuiz}
        >
          Exit Quiz
        </button>
      </section>
    </main>
  );
}
