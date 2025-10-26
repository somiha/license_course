// src/app/(dashboard)/banners/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";

export type Banner = {
  id: string;
  image: string;
  title: string;
  description: string;
  link: string;
  active: boolean;
};

const BASE_URL = "http://localhost:5002";

export const columns: ColumnDef<Banner>[] = [
  { accessorKey: "id", header: "Banner ID" },
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="w-20 h-20 relative overflow-hidden rounded-md">
        <Image
          src={row.original.image}
          alt="image"
          fill
          className="object-cover"
          unoptimized // required for localhost
        />
      </div>
    ),
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const banner = row.original;
      return (
        <div className="flex gap-2">
          <DeleteBannerModal banner={banner} />
        </div>
      );
    },
  },
];

function DeleteBannerModal({ banner }: { banner: Banner }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/banners/${banner.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        size="icon"
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white"
      >
        <Trash className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this banner?
            </DialogDescription>
          </DialogHeader>

          <div className="w-full h-40 relative rounded-md overflow-hidden border mt-2">
            <Image
              src={banner.image}
              alt={`Banner ${banner.id}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white"
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
