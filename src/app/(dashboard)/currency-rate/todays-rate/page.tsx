"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import Link from "next/link";

interface TodayRate {
  currency: string;
  rate: number; // 1 BDT = ? Currency
}

export default function TodaysRatePage() {
  const [rates, setRates] = useState<TodayRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch today's rates on component mount
  useEffect(() => {
    const fetchTodayRates = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://open.er-api.com/v6/latest/BDT");
        const data = await res.json();

        if (data?.result !== "success" || !data?.rates) {
          throw new Error("Failed to fetch rates");
        }

        // Convert to array, filter valid numbers, sort alphabetically
        const ratesArray = Object.entries(data.rates)
          .map(([currency, rate]) => ({
            currency,
            rate: Number(rate),
          }))
          .filter((item) => !isNaN(item.rate) && item.rate > 0)
          .sort((a, b) => a.currency.localeCompare(b.currency));

        setRates(ratesArray);
      } catch (error) {
        console.error("Error fetching today's rates:", error);
        alert("Failed to load today's rates. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayRates();
  }, []); // Run once on mount

  // Filter rates based on search query
  const filteredRates = rates.filter((rate) =>
    rate.currency.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">
                Todays Currency Rates
              </h1>
              <div className="flex gap-2">
                <Link href="/currency-rate">
                  <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                    Back to Currency Rates
                  </Button>
                </Link>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4 relative max-w-sm">
              <Input
                placeholder="Search currency (e.g., USD, EUR)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {loading
                    ? "Loading today's rates..."
                    : `${filteredRates.length} currencies`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Currency</TableHead>
                          <TableHead className="text-right">
                            Rate (1 BDT = ?)
                          </TableHead>
                          <TableHead className="text-right">
                            BDT per Unit
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRates.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center py-4 text-muted-foreground"
                            >
                              No currencies found matching `{searchQuery}``
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRates.map((rate) => (
                            <TableRow key={rate.currency}>
                              <TableCell className="font-medium">
                                {rate.currency}
                              </TableCell>
                              <TableCell className="text-right">
                                {rate.rate.toFixed(6)}
                              </TableCell>
                              <TableCell className="text-right">
                                {(1 / rate.rate).toFixed(6)}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
