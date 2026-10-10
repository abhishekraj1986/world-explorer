
import { useState } from "react";
import { Link } from "react-router-dom";
import { countries } from "./data/countries";

function ComparePage() {
  const [firstCountryId, setFirstCountryId] = useState("1");
  const [secondCountryId, setSecondCountryId] = useState("2");

  const firstCountry = countries.find(
    (country) => country.id === Number(firstCountryId)
  );

  const secondCountry = countries.find(
    (country) => country.id === Number(secondCountryId)
  );

  const comparisonItems = [
    { label: "Capital", key: "capital" },
    { label: "Region", key: "region" },
    { label: "Population", key: "population" },
  ];

  return (
    <main className="compare-page">
      <Link to="/" className="compare-back">
        ← Back to Home
      </Link>

      <section className="compare-heading">
        <p className="hero-tag">COUNTRY COMPARISON</p>
        <h1>Compare Countries 🌍</h1>
        <p className="subtitle">
          Choose two countries and explore their differences.
        </p>
      </section>

      <section className="compare-selectors">
        <div>
          <label htmlFor="first-country">First Country</label>
          <select
            id="first-country"
            value={firstCountryId}
            onChange={(event) => setFirstCountryId(event.target.value)}
          >
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="second-country">Second Country</label>
          <select
            id="second-country"
            value={secondCountryId}
            onChange={(event) => setSecondCountryId(event.target.value)}
          >
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {firstCountry && secondCountry && (
        <section className="comparison-results">
          <div className="comparison-country">
            <div className="comparison-flag">{firstCountry.flag}</div>
            <h2>{firstCountry.name}</h2>
          </div>

          <div className="comparison-country">
            <div className="comparison-flag">{secondCountry.flag}</div>
            <h2>{secondCountry.name}</h2>
          </div>

          <div className="comparison-table">
            {comparisonItems.map((item) => (
              <div className="comparison-row" key={item.key}>
                <div className="comparison-value">
                  {item.key === "population"
                    ? firstCountry[item.key].toLocaleString()
                    : firstCountry[item.key]}
                </div>

                <div className="comparison-label">{item.label}</div>

                <div className="comparison-value">
                  {item.key === "population"
                    ? secondCountry[item.key].toLocaleString()
                    : secondCountry[item.key]}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default ComparePage;
