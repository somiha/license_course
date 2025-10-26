"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchableSelect } from "@/components/ui/searchable-select";

// ✅ Define types for restcountries.com API
interface RestCountryCurrency {
  name: string;
  symbol: string;
}

interface RestCountryCurrencies {
  [code: string]: RestCountryCurrency;
}

interface RestCountryName {
  common: string;
  official: string;
}

interface RestCountryWithCurrency {
  name: RestCountryName;
  currencies?: RestCountryCurrencies;
}

interface RestCountryWithNameOnly {
  name: RestCountryName;
}

export default function AddCurrency() {
  const router = useRouter();

  const [form, setForm] = useState({
    from_currency: "",
    rate: "",
    country: "",
  });

  const [currencies, setCurrencies] = useState<
    { value: string; label: string }[]
  >([]);
  const [countries, setCountries] = useState<
    { value: string; label: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrenciesAndCountries = async () => {
      try {
        // Fetch countries with currencies to extract unique currency list
        const currencyRes = await fetch(
          "https://restcountries.com/v3.1/all?fields=currencies,name"
        );
        const currencyData: RestCountryWithCurrency[] =
          await currencyRes.json();

        // Extract unique currencies
        const currencyMap = new Map<string, string>();
        currencyData.forEach((country) => {
          if (country.currencies) {
            Object.entries(country.currencies).forEach(([code, details]) => {
              if (!currencyMap.has(code)) {
                currencyMap.set(code, details.name || code);
              }
            });
          }
        });

        const currencyOptions = Array.from(currencyMap.entries()).map(
          ([value, label]) => ({
            value,
            label: `${label} (${value})`,
          })
        );

        // Sort alphabetically by label
        currencyOptions.sort((a, b) => a.label.localeCompare(b.label));

        // Fetch country names
        const countryRes = await fetch(
          "https://restcountries.com/v3.1/all?fields=name"
        );
        const countryData: RestCountryWithNameOnly[] = await countryRes.json();

        const countryOptions = countryData
          .map((c) => ({
            value: c.name.common,
            label: c.name.common,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setCurrencies(currencyOptions);
        setCountries(countryOptions);
      } catch (error) {
        console.error("Failed to fetch currencies or countries:", error);
        // Fallbacks if API fails
        setCurrencies([
          { value: "USD", label: "US Dollar (USD)" },
          { value: "EUR", label: "Euro (EUR)" },
          { value: "BDT", label: "Bangladeshi Taka (BDT)" },
          { value: "GBP", label: "British Pound (GBP)" },
          { value: "CAD", label: "Canadian Dollar (CAD)" },
        ]);
        setCountries([
          { value: "United States", label: "United States" },
          { value: "Bangladesh", label: "Bangladesh" },
          { value: "Germany", label: "Germany" },
          { value: "Canada", label: "Canada" },
          { value: "United Kingdom", label: "United Kingdom" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrenciesAndCountries();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");

    if (!form.from_currency || !form.rate || !form.country) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(
        "https://api.t-coin.code-studio4.com/api/tcoin-rates",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from_currency: form.from_currency,
            rate: parseFloat(form.rate),
            country: form.country,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Currency added successfully!");
        router.push("/currency-rate");
      } else {
        alert(data.message || "Failed to add currency.");
      }
    } catch (error) {
      console.error("Error submitting currency:", error);
      alert("Something went wrong.");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Currency</h2>
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 flex items-center justify-center h-32">
            <span className="text-gray-500">
              Loading currencies and countries...
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Currency</h2>

      <form onSubmit={handleSubmit}>
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 space-y-6 lg:pl-16 md:pl-1">
            {/* Select Currency */}
            <div className="w-full max-w-[600px]">
              <Label className="block mb-4 text-md font-medium">
                Select Currency Type
              </Label>
              <SearchableSelect
                options={currencies}
                placeholder="Currency"
                value={form.from_currency}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, from_currency: value }))
                }
              />
            </div>

            {/* Currency Rate */}
            <div className="w-full max-w-[600px]">
              <Label className="block mb-4 text-md font-medium">
                Currency Rate
              </Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={form.rate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, rate: e.target.value }))
                }
                required
              />
            </div>

            {/* Country Name */}
            <div className="w-full max-w-[600px]">
              <Label className="block mb-4 text-md font-medium">Country</Label>
              <SearchableSelect
                options={countries}
                placeholder="Country"
                value={form.country}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, country: value }))
                }
              />
            </div>

            <Button
              className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white"
              type="submit"
            >
              Save
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
