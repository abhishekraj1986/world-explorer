
import { useState } from "react";
import { Link } from "react-router-dom";

function ComparePage({ countries = [] }) {
  const [firstCountryId, setFirstCountryId] = useState("IND");
  const [secondCountryId, setSecondCountryId] = useState("JPN");

  const firstCountry = countries.find(
    (country) => country.id === firstCountryId
  );

  const secondCountry = countries.find(
    (country) => country.id === secondCountryId
  );

  const comparisonItems = [
    { label: "Capital", key: "capital" },
    { label: "Region", key: "region" },
    { label: "Subregion", key: "subregion" },
    { label: "Population", key: "population", numeric: true },
    { label: "Area (km²)", key: "area", numeric: true },
    {
      label: "Official Name",
      key: "officialName",
    },
  ];

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString();

  return (
    <main className="compare-page">
      <Link to="/" className="compare-back">
        ← Back to Home
      </Link>

      <section className="compare-heading">
        <p className="hero-tag">COUNTRY COMPARISON</p>
        <h1>Compare Countries 🌍</h1>
        <p className="subtitle">
          Explore the differences between any two countries.
        </p>
      </section>

      <section className="compare-selectors">
        <div>
          <label htmlFor="first-country">First Country</label>
          <select
            id="first-country"
            value={firstCountryId}
            onChange={(event) =>
              setFirstCountryId(event.target.value)
            }
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
            onChange={(event) =>
              setSecondCountryId(event.target.value)
            }
          >
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {countries.length === 0 ? (
        <p>Loading countries for comparison...</p>
      ) : firstCountry && secondCountry ? (
        <section className="comparison-results">
          <div className="comparison-country">
            <div className="comparison-flag">
              {firstCountry.flagImage ? (
                <img
                  src={firstCountry.flagImage}
                  alt={`${firstCountry.name} flag`}
                />
              ) : (
                firstCountry.flag
              )}
            </div>
            <h2>{firstCountry.name}</h2>
          </div>

          <div className="comparison-country">
            <div className="comparison-flag">
              {secondCountry.flagImage ? (
                <img
                  src={secondCountry.flagImage}
                  alt={`${secondCountry.name} flag`}
                />
              ) : (
                secondCountry.flag
              )}
            </div>
            <h2>{secondCountry.name}</h2>
          </div>

          <div className="comparison-table">
            {comparisonItems.map((item) => (
              <div className="comparison-row" key={item.key}>
                <div className="comparison-value">
                  {item.numeric
                    ? formatNumber(firstCountry[item.key])
                    : firstCountry[item.key] || "N/A"}
                </div>

                <div className="comparison-label">
                  {item.label}
                </div>

                <div className="comparison-value">
                  {item.numeric
                    ? formatNumber(secondCountry[item.key])
                    : secondCountry[item.key] || "N/A"}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <p>Choose two countries to compare.</p>
      )}
    </main>
  );
}

export default ComparePage;
