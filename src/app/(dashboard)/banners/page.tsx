// src/app/(dashboard)/banners/page.tsx
"use client";

import { useEffect, useState } from "react";
import { columns, Banner } from "./columns";
import { DataTable } from "../data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface BannerFromAPI {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const BASE_URL = "http://localhost:5002";

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Missing authToken");
      setLoading(false);
      return;
    }

    fetch(`${BASE_URL}/api/banners`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Handle both possible shapes: { banners: [...] } or direct array
        const bannerList = Array.isArray(data)
          ? data
          : Array.isArray(data.banners)
          ? data.banners
          : [];

        const formatted: Banner[] = bannerList.map((item: BannerFromAPI) => ({
          id: String(item.id),
          image: item.image,
          title: item.title,
          description: item.description,
          link: item.link,
          active: item.active,
        }));
        setBanners(formatted);
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
              <h1 className="text-2xl font-bold tracking-tight">Banners</h1>
              <Link href="/banners/add-banner">
                <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                  + Add Banner
                </Button>
              </Link>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <DataTable columns={columns} data={banners} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
