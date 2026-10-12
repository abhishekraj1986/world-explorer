
const API_URL = "https://api.restcountries.com/countries/v5";
const API_KEY = import.meta.env.VITE_REST_COUNTRIES_API_KEY;

async function fetchPage(offset) {
  const response = await fetch(
    `${API_URL}?limit=100&offset=${offset}`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.errors?.[0]?.message ||
        `API request failed (${response.status})`
    );
  }

  return result.data;
}

export async function fetchCountries() {
  if (!API_KEY) {
    throw new Error(
      "API key missing. Please add it to .env.local"
    );
  }

  const allCountries = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const page = await fetchPage(offset);
    const items = page.objects || [];

    allCountries.push(...items);

    hasMore = page.meta?.more === true;
    offset += items.length;

    if (items.length === 0) break;
  }

  return allCountries
    .map((item) => {
      const alpha2 = item.codes?.alpha_2;
      const currencies = item.currencies || {};

      return {
        id: item.codes?.alpha_3 || alpha2,
        name: item.names?.common || "Unknown Country",
        officialName: item.names?.official || item.names?.common || "Unknown",
        capital: item.capitals?.[0]?.name || "N/A",
        region: item.region || "Other",
        subregion: item.subregion || "N/A",
        population: item.population ?? 0,
        area: item.area?.kilometers ?? 0,
        flag: item.flag?.emoji || "🏳️",
        flagImage: alpha2
          ? `https://flags.restcountries.com/v5/w320/${alpha2.toLowerCase()}.png`
          : "",
        languages: (item.languages || []).map(
          (language) => language.name
        ).filter(Boolean),
        currencies: Object.values(currencies).map(
          (currency) => ({
            name: currency.name,
            symbol: currency.symbol || "",
          })
        ),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
