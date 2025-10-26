"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddBreakingNewsPage() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    active_status: true,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "https://api.t-coin.code-studio4.com/api/breaking-news",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Breaking news added successfully!");
        router.push("/breaking-news");
      } else {
        alert(result.message || "Failed to add breaking news");
      }
    } catch (error) {
      console.error("Error adding breaking news:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Add Breaking News</h2>
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="News title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Input
                id="content"
                name="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="News content"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="active_status">Active Status</Label>
              <Switch
                id="active_status"
                checked={form.active_status}
                onCheckedChange={(checked) =>
                  setForm({ ...form, active_status: checked })
                }
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Add News"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
