"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter a category name");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("You must be logged in");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        formData.append("image", file);
      }

      // ✅ Use localhost for dev consistency
      const response = await fetch(
        "https://course-selling-app.saveneed.com/api/categories",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // ⚠️ DO NOT set Content-Type — browser sets it automatically with boundary
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.category) {
        alert("Category added successfully!");
        router.push("/category");
      } else {
        const errorMsg = result.message || "Failed to add category";
        console.error("API Error:", errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Category Image</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="w-24 h-24 relative rounded overflow-hidden border">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                  No image
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileSelect}
              >
                Choose Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Category"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
