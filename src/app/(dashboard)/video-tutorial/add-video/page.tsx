"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function AddVideoPage() {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "video" | "thumbnail"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "video") {
        setVideoFile(file);
      } else {
        setThumbnailFile(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (!videoFile || !thumbnailFile) {
      alert("Please upload both video and thumbnail.");
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("video", videoFile);
    formData.append("thumbnail", thumbnailFile);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        "https://api.t-coin.code-studio4.com/api/video-tutorial",
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Video uploaded successfully!");
        window.location.href = "/video-tutorial";
      } else {
        console.error("Upload failed:", result.message);
        alert("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Add New Video</h2>
      <Card>
        <CardContent className="p-6 space-y-6 lg:pl-16">
          <div className="w-full max-w-[600px] space-y-4">
            <Input
              name="title"
              placeholder="Video Title"
              value={form.title}
              onChange={handleChange}
            />
            <Input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            {/* Video Upload */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer text-center hover:bg-gray-50"
              onClick={() => videoInputRef.current?.click()}
            >
              <Input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "video")}
              />
              <Button variant="ghost" size="icon">
                <PlusCircle className="h-6 w-6" />
              </Button>
              <p className="text-sm text-gray-500">Upload Video File</p>
              {videoFile && (
                <p className="text-xs text-green-600">{videoFile.name}</p>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer text-center hover:bg-gray-50"
              onClick={() => thumbnailInputRef.current?.click()}
            >
              <Input
                type="file"
                ref={thumbnailInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "thumbnail")}
              />
              <Button variant="ghost" size="icon">
                <PlusCircle className="h-6 w-6" />
              </Button>
              <p className="text-sm text-gray-500">Upload Thumbnail Image</p>
              {thumbnailFile && (
                <p className="text-xs text-green-600">{thumbnailFile.name}</p>
              )}
            </div>

            <Button
              className="w-full bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white"
              onClick={handleSubmit}
            >
              Upload Video
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
