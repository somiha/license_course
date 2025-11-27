// src/app/(dashboard)/topics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { topicColumns, Topic } from "./columns";
import { DataTable } from "../data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TopicFromAPI {
  id: number;
  course_id: number;
  title: string;
  serial_id: number;
  description: string;
  pdf_link: string | null;
  other: string | null;
  image: string | null;
  video: string | null;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Missing authToken");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://course-selling-app.saveneed.com/api/topics?page=1&limit=10",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch topics");

        const data = await response.json();

        if (Array.isArray(data.details)) {
          const formatted: Topic[] = data.details.map((item: TopicFromAPI) => ({
            id: String(item.id),
            courseId: item.course_id,
            title: item.title,
            serialId: item.serial_id,
            description: item.description,
            pdfLink: item.pdf_link,
            other: item.other,
            image: item.image?.trim() || null,
            video: item.video?.trim() || null,
            courseName: "", // Will be filled in modal
          }));
          setTopics(formatted);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
              <Link href="/topics/add-topic">
                <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                  + Add Topic
                </Button>
              </Link>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <DataTable columns={topicColumns} data={topics} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
