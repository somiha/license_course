"use client";

import { useEffect, useState } from "react";
import { detailColumns, ItemContent } from "./columns";
import { DataTable } from "../data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const BASE_URL = "https://course-selling-app.saveneed.com";

export default function ItemContentsPage() {
  const [contents, setContents] = useState<ItemContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
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

        if (!res.ok) throw new Error("Failed to fetch contents");

        const data = await res.json();

        const formatted: ItemContent[] = data.contents.map(
          (c: ItemContent) => ({
            id: c.id,
            chapter_details_id: c.chapter_details_id,
            content: c.content,
            image: c.image,
            video: c.video,
            audios: [], // will fetch in modal
          })
        );

        setContents(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Item Contents</h1>
        <Link href="/chapter-items/add-item">
          <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
            + Add Item
          </Button>
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={detailColumns} data={contents} />
      )}
    </div>
  );
}
