"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AddCountryPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    active: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = () => {
    setForm((prev) => ({
      ...prev,
      active: !prev.active,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code) {
      alert("Please fill out all fields.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "https://api.t-coin.code-studio4.com/api/country",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Country added successfully!");
        window.location.href = "/country"; // redirect to country list
      } else {
        console.error("Failed to add country:", result.message);
        alert("Failed to add country.");
      }
    } catch (error) {
      console.error("Error submitting country:", error);
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Add New Country</h2>
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-6">
          <Input
            name="name"
            placeholder="Country Name"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            name="code"
            placeholder="Country Code"
            value={form.code}
            onChange={handleChange}
          />
          <div className="flex items-center gap-2">
            <Label>Active:</Label>
            <Switch checked={form.active} onCheckedChange={handleToggle} />
            <span>{form.active ? "Yes" : "No"}</span>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Country"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
