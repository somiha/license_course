"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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

export const breakingNewsColumns: ColumnDef<BreakingNewsTableData>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => (
      <div className="max-w-xs truncate">{row.original.content}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (row.original.status ? "Active" : "Inactive"),
  },
  { accessorKey: "publishedAt", header: "Published At" },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const news = row.original;
      return (
        <div className="flex gap-2">
          <EditNewsModal id={news.id} />
          <DeleteNewsModal id={news.id} />
        </div>
      );
    },
  },
];

function EditNewsModal({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<BreakingNewsFormData>({
    title: "",
    content: "",
    active_status: true,
  });
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      // First fetch all news
      const response = await fetch(
        "https://api.t-coin.code-studio4.com/api/breaking-news",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();

      // Then find the specific news item by ID
      if (data.success && Array.isArray(data.data)) {
        const foundNews = data.data.find(
          (item: BreakingNews) => String(item.id) === id
        );
        if (foundNews) {
          setForm({
            title: foundNews.title,
            content: foundNews.content,
            active_status: foundNews.active_status,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://api.t-coin.code-studio4.com/api/breaking-news/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("News updated successfully!");
        window.location.reload();
      } else {
        alert(result.message || "Failed to update news");
      }
    } catch (error) {
      console.error("Error updating news:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="icon"
        onClick={() => {
          setIsOpen(true);
          fetchNews();
        }}
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit News</DialogTitle>
          </DialogHeader>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              <Input
                name="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Title"
              />
              <Input
                name="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Content"
              />
              <div className="flex items-center gap-2">
                <Label>Active Status</Label>
                <Switch
                  checked={form.active_status}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, active_status: checked })
                  }
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DeleteNewsModal({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `https://api.t-coin.code-studio4.com/api/breaking-news/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("News deleted successfully!");
        window.location.reload();
      } else {
        alert(result.message || "Failed to delete news");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      alert("Something went wrong");
    }

    setLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        size="icon"
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Trash className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete News</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this news item? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
