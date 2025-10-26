"use client";

import { useEffect, useState } from "react";
import { DataTable } from "../data-table";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RawCurrencyLog {
  id: number;
  tcoinRateId: number;
  action: string;
  oldValue: {
    id: number;
    from_currency: string;
    rate: number;
    country: string;
    createdAt: string;
    updatedAt: string;
  };
  newValue: {
    id: number;
    from_currency: string;
    rate: number;
    country: string;
    createdAt: string;
    updatedAt: string;
  };
  changedAt: string;
  user?: string;
}

interface CurrencyLog {
  id: string;
  from_currency: string;
  old_rate: number;
  new_rate: number;
  changed_at: string;
  user?: string;
}

export default function CurrencyHistoryPage() {
  const [logs, setLogs] = useState<CurrencyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (!token) {
      console.error("Missing authToken");
      setLoading(false);
      return;
    }

    fetch("https://api.t-coin.code-studio4.com/api/tcoin-rates/all/logs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (Array.isArray(json.data)) {
          const formatted = (json.data as RawCurrencyLog[]).map((entry) => ({
            id: entry.id.toString(),
            from_currency: entry.newValue?.from_currency.toUpperCase() || "N/A",
            old_rate: Number(entry.oldValue?.rate) || 0,
            new_rate: Number(entry.newValue?.rate) || 0,
            changed_at: entry.changedAt,
            user: entry.user || "N/A",
          }));

          setLogs(formatted);
        } else {
          console.error("Unexpected response:", json);
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const columns: ColumnDef<CurrencyLog>[] = [
    {
      accessorKey: "from_currency",
      header: "Currency",
      footer: (info) => info.column.id,
    },
    {
      accessorKey: "old_rate",
      header: "Old Rate",
      footer: (info) => info.column.id,
    },
    {
      accessorKey: "new_rate",
      header: "New Rate",
      footer: (info) => info.column.id,
    },
    {
      accessorKey: "changed_at",
      header: "Changed At",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      footer: (info) => info.column.id,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">
                Currency Change History
              </h1>
              <Link href="/currency-rate">
                <Button className="bg-gray-600 text-white hover:bg-gray-700">
                  Back to Rates
                </Button>
              </Link>
            </div>

            {loading ? (
              <p>Loading currency change history...</p>
            ) : (
              <DataTable columns={columns} data={logs} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
