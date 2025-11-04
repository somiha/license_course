// src/app/(dashboard)/chapters/page.tsx
"use client";

import { useEffect, useState } from "react";
import { chapterColumns, Chapter } from "./columns";
import { DataTable } from "../data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ChapterFromAPI {
  id: number;
  course_id: number;
  title: string;
  image: string | null;
  course_name: string;
}

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Missing authToken");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://course-selling-app.saveneed.com/api/chapters?page=1&limit=10",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch chapters");

        const data = await response.json();

        if (Array.isArray(data.chapters)) {
          const formatted: Chapter[] = data.chapters.map(
            (item: ChapterFromAPI) => ({
              id: String(item.id),
              courseId: item.course_id,
              title: item.title,
              image: item.image?.trim() || null, // ✅ trim extra spaces
              courseName: item.course_name,
            })
          );
          setChapters(formatted);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Chapters</h1>
              <Link href="/chapters/add-chapter">
                <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                  + Add Chapter
                </Button>
              </Link>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <DataTable columns={chapterColumns} data={chapters} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
