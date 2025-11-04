"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = "https://course-selling-app.saveneed.com";

export default function AddBannerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in.");
      return;
    }

    if (!imageFile) {
      alert("Please upload a banner image.");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("image", imageFile);

    setIsSubmitting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/banners`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ⚠️ DO NOT set Content-Type — browser sets it with boundary
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.banner) {
        alert("Banner added successfully!");
        router.push("/banners");
      } else {
        const errorMsg = result.message || "Failed to create banner";
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
      <h2 className="text-xl font-semibold mb-4">Add New Banner</h2>
      <Card className="w-full">
        <CardContent className="p-6 space-y-6">
          <div className="w-full max-w-[600px] space-y-4">
            <div className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] p-3 rounded-md">
              ⚠️ Banner size must be <strong>350px × 150px</strong>
            </div>

            {/* Image Upload */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleClick}
            >
              <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="group relative h-12 w-12 rounded-full bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white shadow-lg hover:shadow-xl"
                >
                  <div>
                    <PlusCircle className="h-6 w-6" />
                  </div>
                </Button>
                <p className="text-sm text-gray-500">Upload Image</p>
                {imageFile && (
                  <p className="text-xs text-green-600">{imageFile.name}</p>
                )}
              </div>
            </div>

            <Button
              className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white w-full"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Save Banner"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
