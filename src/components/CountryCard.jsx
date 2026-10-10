
import { Link } from "react-router-dom";

function CountryCard({ country, isFavorite, onToggleFavorite }) {
  return (
    <div className="country-card">
      <div className="country-flag">{country.flag}</div>

      <h2>{country.name}</h2>

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

      <div className="card-actions">
        <Link
          to={`/country/${country.id}`}
          className="view-details"
        >
          View Details →
        </Link>

        <button
          type="button"
          className="favorite-button"
          onClick={() => onToggleFavorite(country.id)}
          aria-pressed={isFavorite}
        >
          {isFavorite ? "❤️ Saved" : "♡ Favorite"}
        </button>
      </div>
    </div>
  );
}

export default CountryCard;
