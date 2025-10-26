// src/app/(dashboard)/category/page.tsx
"use client";

import { useEffect, useState } from "react";
import { categoryColumns, Category } from "./columns";
import { DataTable } from "../data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Match actual list API response
interface CategoryFromAPI {
  id: number;
  name: string;
  image: string;
  created_at: string;
  updated_at: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Missing authToken");
        setLoading(false);
        return;
      }

      try {
        // ✅ Use correct local URL (no trailing spaces!)
        const response = await fetch(
          "https://course-selling-app.saveneed.com/api/categories?page=1&limit=10",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch categories");

        const data = await response.json();

        // ✅ Parse actual shape: { categories: [...] }
        if (Array.isArray(data.categories)) {
          const formatted: Category[] = data.categories.map(
            (cat: CategoryFromAPI) => ({
              id: String(cat.id),
              name: cat.name,
              image: cat.image,
            })
          );
          setCategories(formatted);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
              <Link href="/category/add-category">
                <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                  + Add Category
                </Button>
              </Link>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <DataTable columns={categoryColumns} data={categories} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
