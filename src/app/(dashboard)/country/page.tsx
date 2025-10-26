"use client";

import { useEffect, useState } from "react";
import { countryColumns, Country } from "./column";
import { DataTable } from "../data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// CountryApiResponse interface for typing the API response
interface CountryApiResponse {
  id: number;
  name: string;
  code: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Countries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("Missing authToken");
      return;
    }

    // Fetching countries data from API
    fetch("https://api.t-coin.code-studio4.com/api/country", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Checking API response success and validity
        if (data.success && Array.isArray(data.data)) {
          const formatted: Country[] = (data.data as CountryApiResponse[]).map(
            (item) => ({
              id: String(item.id),
              name: item.name,
              code: item.code,
              active: item.active,
            })
          );
          setCountries(formatted);
        } else {
          console.error("Invalid country response", data);
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Countries</h1>
              <Link href="/country/add-country">
                <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                  + Add Country
                </Button>
              </Link>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <DataTable columns={countryColumns} data={countries} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
