import { useState } from "react";
import { countries } from "./data/countries";
import CountryCard from "./components/CountryCard";

function App() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");

  const filteredCountries = countries.filter((country) => {
    const matchesSearch = country.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesRegion =
      region === "All" || country.region === region;

    return matchesSearch && matchesRegion;
  });

  return (
    <main>
      <h1>Explore the World 🌍</h1>

      <p className="subtitle">
        Discover countries, capitals and cultures.
      </p>

      <div className="filters">
        <input
          type="text"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="All">All Regions</option>
          <option value="Asia">Asia</option>
          <option value="Europe">Europe</option>
          <option value="Africa">Africa</option>
          <option value="South America">South America</option>
          <option value="Oceania">Oceania</option>
        </select>
      </div>

      <div className="country-grid">
        {filteredCountries.map((country) => (
          <CountryCard
            key={country.id}
            country={country}
          />
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <p className="no-results">
          No countries found 😕
        </p>
      )}
    </main>
  );
}

export default App;