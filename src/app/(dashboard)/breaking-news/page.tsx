"use client";

import { useEffect, useState } from "react";
import { breakingNewsColumns } from "./columns";
import { DataTable } from "../data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface BreakingNews {
  id: number;
  title: string;
  content: string;
  active_status: boolean;
  publishedAt: string;
}

export interface BreakingNewsTableData {
  id: string;
  title: string;
  content: string;
  status: boolean;
  publishedAt: string;
}

export interface BreakingNewsFormData {
  title: string;
  content: string;
  active_status: boolean;
}

export default function BreakingNewsPage() {
  const [news, setNews] = useState<BreakingNewsTableData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch(
          "https://api.t-coin.code-studio4.com/api/breaking-news",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setNews(
            data.data.map((item: BreakingNews) => ({
              id: String(item.id),
              title: item.title,
              content: item.content,
              status: item.active_status,
              publishedAt: new Date(item.publishedAt).toLocaleString(),
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching breaking news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">
                Breaking News
              </h1>
              <Link href="/breaking-news/add-breaking-news">
                <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                  + Add News
                </Button>
              </Link>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <DataTable columns={breakingNewsColumns} data={news} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
