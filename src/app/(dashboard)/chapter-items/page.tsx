// src/app/(dashboard)/item-contents/page.tsx
"use client";

import { useEffect, useState } from "react";
import { detailColumns, ItemContent } from "./columns";
import { DataTable } from "../data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const BASE_URL = "https://course-selling-app.saveneed.com";

// === Type Definitions (shared with columns) ===
interface ContentLang {
  id: number;
  language: string;
  content: string;
}

interface ApiResponseItem {
  id: number;
  chapter_details_id: number;
  content: string | null;
  content_and_language: ContentLang[] | null;
  image: string | null;
  video: string | null;
}

interface ApiListResponse {
  contents: ApiResponseItem[];
}

export default function ItemContentsPage() {
  const [contents, setContents] = useState<ItemContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${BASE_URL}/api/item-contents?page=1&limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch item contents");

        const data: unknown = await res.json();

        // ✅ Validate response structure
        if (
          typeof data === "object" &&
          data !== null &&
          "contents" in data &&
          Array.isArray((data as { contents: unknown }).contents)
        ) {
          const apiContents = (data as ApiListResponse).contents;

          const formatted: ItemContent[] = apiContents.map((c) => ({
            id: c.id,
            chapter_details_id: c.chapter_details_id,
            content: c.content,
            content_and_language: c.content_and_language,
            image: c.image,
            video: c.video,
            audios: [], // will be loaded in modal
          }));

          setContents(formatted);
        } else {
          console.warn("Invalid data format:", data);
          setContents([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setContents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Item Contents</h1>
        <Link href="/chapter-items/add-item">
          <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
            + Add Item
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-center py-4 text-muted-foreground">Loading...</p>
      ) : contents.length === 0 ? (
        <p className="text-center py-4 text-muted-foreground">
          No item contents found.
        </p>
      ) : (
        <DataTable columns={detailColumns} data={contents} />
      )}
    </div>
  );
}
