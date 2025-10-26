"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "../data-table";
import type { Currency } from "./columns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type TCoinRateApiItem = {
  id: number;
  from_currency: string;
  rate: string;
  country: string;
};

export default function CurrencyPage() {
  const [currencyRates, setCurrencyRates] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  // const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTcoinRates();
  }, []);

  const fetchTcoinRates = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (!token) {
      console.error("Missing token");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch("https://api.t-coin.code-studio4.com/api/tcoin-rates", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          const formatted: Currency[] = resData.data.map(
            (item: TCoinRateApiItem) => ({
              id: item.id.toString(),
              name: (item.from_currency || "").toUpperCase(),
              value: parseFloat(item.rate),
              country: item.country,
            })
          );
          setCurrencyRates(formatted);
        } else {
          console.error("Unexpected response format:", resData);
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  };

  // Refresh today's rates and send to bulk update API
  // const fetchTodayCurrencyRates = async () => {
  //   try {
  //     setRefreshing(true);
  //     const token =
  //       typeof window !== "undefined"
  //         ? localStorage.getItem("authToken")
  //         : null;

  //     if (!token) {
  //       console.error("Missing token");
  //       return;
  //     }

  //     const res = await fetch("https://open.er-api.com/v6/latest/BDT");
  //     const data = await res.json();

  //     if (data?.result !== "success" || !data?.rates) {
  //       console.error("Unexpected open.er-api response:", data);
  //       return;
  //     }

  //     // Create updated list
  //     const updated = currencyRates.map((row) => {
  //       const code = row.name.toUpperCase();
  //       const rateFromBDTtoCode = data.rates[code];
  //       if (typeof rateFromBDTtoCode !== "number" || rateFromBDTtoCode === 0) {
  //         return row;
  //       }
  //       const valueBDTperUnit = 1 / rateFromBDTtoCode;
  //       return { ...row, value: valueBDTperUnit };
  //     });

  //     setCurrencyRates(updated);

  //     const updatesPayload = updated.map((row) => ({
  //       id: Number(row.id),
  //       from_currency: row.name,
  //       rate: row.value,
  //     }));

  //     const updateRes = await fetch(
  //       "https://api.t-coin.code-studio4.com/api/tcoin-rates/bulk/update",
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ updates: updatesPayload }),
  //       }
  //     );

  //     const updateData = await updateRes.json();
  //     if (!updateRes.ok) {
  //       throw new Error(updateData?.message || "Failed to update rates");
  //     }

  //     console.log("Rates updated successfully:", updateData);
  //   } catch (error) {
  //     console.error("Error updating today's BDT-based rates:", error);
  //   } finally {
  //     setRefreshing(false);
  //   }
  // };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">
                Currency Rate
              </h1>
              <div className="flex gap-2">
                {/* <Button
                  onClick={fetchTodayCurrencyRates}
                  disabled={refreshing}
                  className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90 disabled:opacity-60"
                >
                  {refreshing ? "Refreshing…" : "Refresh Today’s Rates"}
                </Button> */}
                <Link href="/currency-rate/todays-rate">
                  <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                    Todays Rate
                  </Button>
                </Link>
                <Link href="/currency-rate/add-currency">
                  <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                    + Add Currency Rate
                  </Button>
                </Link>
              </div>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <DataTable columns={columns} data={currencyRates} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
