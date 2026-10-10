
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

import { countries } from "./data/countries";
import CountryCard from "./components/CountryCard";
import ComparePage from "./ComparePage.jsx";
import QuizPage from "./QuizPage.jsx";

function HomePage({ favorites, onToggleFavorite }) {
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [sortOrder, setSortOrder] = useState("name");
  const [showFavorites, setShowFavorites] = useState(false);

  const regions = [
    "All",
    ...new Set(countries.map((country) => country.region)),
  ];

  const filteredCountries = countries
    .filter((country) =>
      country.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(
      (country) =>
        selectedRegion === "All" ||
        country.region === selectedRegion
    )
    .filter(
      (country) =>
        !showFavorites || favorites.includes(country.id)
    )
    .sort((a, b) => {
      if (sortOrder === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortOrder === "population-high") {
        return b.population - a.population;
      }

      if (sortOrder === "population-low") {
        return a.population - b.population;
      }

      return 0;
    });

  return (
    <main>
      <section className="hero">
        <p className="hero-tag">DISCOVER OUR WORLD</p>

        <h1>
          Explore the <span>World</span> 🌍
        </h1>

        <p className="subtitle">
          Discover countries, explore cultures, and learn about
          our amazing planet — all in one place.
        </p>

        <div className="home-feature-links">
          <Link to="/compare" className="view-details">
            Compare Countries →
          </Link>

          <Link to="/quiz" className="view-details">
            Play Geography Quiz →
          </Link>
        </div>
      </section>

      <section id="countries">
        <div className="favorites-heading">
          <h2>
            {showFavorites
              ? "Your Favorite Countries ❤️"
              : "Explore Countries"}
          </h2>

          <button
            type="button"
            className="favorites-filter-button"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            {showFavorites ? "Show All Countries" : "Show Favorites ❤️"}
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search a country..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={selectedRegion}
            onChange={(event) => setSelectedRegion(event.target.value)}
            aria-label="Filter by region"
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region === "All" ? "All Regions" : region}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            aria-label="Sort countries"
          >
            <option value="name">Sort by Name</option>
            <option value="population-high">
              Population: High to Low
            </option>
            <option value="population-low">
              Population: Low to High
            </option>
          </select>
        </div>

        {filteredCountries.length > 0 ? (
          <div className="country-grid">
            {filteredCountries.map((country) => (
              <CountryCard
                key={country.id}
                country={country}
                isFavorite={favorites.includes(country.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <p className="no-results">
            {showFavorites
              ? "No favorite countries yet. Add one using the Favorite button!"
              : "No countries found. Try another search."}
          </p>
        )}
      </section>
    </main>
  );
}

function CountryDetailPage({ favorites, onToggleFavorite }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const country = countries.find(
    (item) => item.id === Number(id)
  );

  if (!country) {
    return (
      <main className="detail-page">
        <h1>Country not found 😕</h1>
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      </main>
    );
  }

  const isFavorite = favorites.includes(country.id);

  return (
    <main className="detail-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/")}
      >
        ← Back to Countries
      </button>

      <section className="detail-card">
        <div className="detail-flag">{country.flag}</div>

        <h1>{country.name}</h1>

        <p className="detail-intro">
          Discover more about {country.name}.
        </p>

        <div className="detail-info">
          <p>
            <strong>Capital:</strong> {country.capital}
          </p>

          <p>
            <strong>Region:</strong> {country.region}
          </p>

          <p>
            <strong>Population:</strong>{" "}
            {country.population.toLocaleString()}
          </p>
        </div>

        <button
          type="button"
          className="favorite-button"
          onClick={() => onToggleFavorite(country.id)}
          aria-pressed={isFavorite}
        >
          {isFavorite ? "❤️ Saved to Favorites" : "♡ Add to Favorites"}
        </button>
      </section>
    </main>
  );
}

function App() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const savedFavorites = localStorage.getItem(
        "worldExplorerFavorites"
      );

      return savedFavorites ? JSON.parse(savedFavorites) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "worldExplorerFavorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  function toggleFavorite(countryId) {
    setFavorites((previousFavorites) =>
      previousFavorites.includes(countryId)
        ? previousFavorites.filter((id) => id !== countryId)
        : [...previousFavorites, countryId]
    );
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-logo">
          🌍 World Explorer
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/#countries">Countries</Link>
          <Link to="/compare">Compare</Link>
          <Link to="/quiz">Quiz 🧠</Link>
        </div>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          }
        />

        <Route
          path="/country/:id"
          element={
            <CountryDetailPage
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          }
        />

        <Route
          path="/compare"
          element={<ComparePage />}
        />

        <Route
          path="/quiz"
          element={<QuizPage />}
        />
      </Routes>
    </>
  );
}

export default App;
