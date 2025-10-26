"use client";

import { useEffect, useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import type { Video } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Corrected API response type
type ApiVideo = {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
};

export default function VideoPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    fetch("https://api.t-coin.code-studio4.com/api/video-tutorial", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.tutorials)) {
          const formatted: Video[] = resData.tutorials.map((v: ApiVideo) => ({
            id: v.id.toString(),
            title: v.title,
            description: v.description,
            videoUrl: v.videoUrl,
            thumbnail: v.thumbnail,
          }));
          setVideos(formatted);
        } else {
          console.error("Invalid API response:", resData);
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
              <h1 className="text-2xl font-bold tracking-tight">
                Video Tutorials
              </h1>
              <Link href="/video-tutorial/add-video">
                <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                  + Add Video
                </Button>
              </Link>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <DataTable columns={columns} data={videos} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
