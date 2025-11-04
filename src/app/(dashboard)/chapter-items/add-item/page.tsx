"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";

const BASE_URL = "https://course-selling-app.saveneed.com";

interface ChapterDetail {
  id: number;
  title: string;
}

interface AudioInput {
  file: File | null;
  language: string;
}

export default function AddItemPage() {
  const [chapterDetails, setChapterDetails] = useState<ChapterDetail[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [audios, setAudios] = useState<AudioInput[]>([
    { file: null, language: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ✅ Fetch chapter details for select dropdown
  useEffect(() => {
    const fetchChapterDetails = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/chapter-details?page=1&limit=10`
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.details)) {
          setChapterDetails(data.details);
        } else {
          toast.error("Failed to load chapter details");
        }
      } catch {
        toast.error("Network error while loading chapters");
      }
    };

    fetchChapterDetails();
  }, []);

  // ✅ Handle file inputs
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Audio handlers
  const handleAudioChange = (index: number, file: File | null) => {
    setAudios((prev) => {
      const updated = [...prev];
      updated[index].file = file;
      return updated;
    });
  };

  const handleLanguageChange = (index: number, language: string) => {
    setAudios((prev) => {
      const updated = [...prev];
      updated[index].language = language;
      return updated;
    });
  };

  const addAudioField = () => {
    setAudios((prev) => [...prev, { file: null, language: "" }]);
  };

  // ✅ Submit all data
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedChapterId) {
      toast.error("Please select a chapter detail");
      return;
    }

    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);

    try {
      // --- 1️⃣ Submit Item Content ---
      const contentForm = new FormData();
      contentForm.append("chapter_details_id", selectedChapterId);
      contentForm.append("content", content);
      if (imageFile) contentForm.append("image", imageFile);
      if (videoFile) contentForm.append("video", videoFile);

      const contentRes = await fetch(`${BASE_URL}/api/item-contents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: contentForm,
      });

      const contentResult = await contentRes.json();
      if (!contentRes.ok)
        throw new Error(contentResult.message || "Failed to upload content");

      // --- 2️⃣ Submit Audios ---
      for (const audio of audios) {
        if (audio.file && audio.language.trim()) {
          const audioForm = new FormData();
          audioForm.append("chapter_details_id", selectedChapterId);
          audioForm.append("audio", audio.file);
          audioForm.append("language", audio.language);

          await fetch(`${BASE_URL}/api/item-audios`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: audioForm,
          });
        }
      }

      toast.success("Item content & audios added successfully!");
      setContent("");
      setImageFile(null);
      setVideoFile(null);
      setImagePreview(null);
      setVideoPreview(null);
      setAudios([{ file: null, language: "" }]);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while saving data");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Add Item Content & Audios</h2>
      <Card className="w-full max-w-3xl">
        <CardContent className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chapter Detail Select */}
            <div className="space-y-2">
              <Label htmlFor="chapter">Select Chapter Detail *</Label>
              <select
                id="chapter"
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="border rounded-md w-full px-3 py-2"
                required
              >
                <option value="">Select a chapter...</option>
                {chapterDetails.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write content here..."
                rows={3}
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image (optional)</Label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="rounded object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                    No image
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                >
                  Choose Image
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <Label>Video (optional)</Label>
              <div className="flex items-center gap-4">
                {videoPreview ? (
                  <video
                    controls
                    className="w-48 h-32 rounded border object-cover"
                    src={videoPreview}
                  />
                ) : (
                  <div className="w-48 h-32 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                    No video
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => videoInputRef.current?.click()}
                >
                  Choose Video
                </Button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Audios */}
            <div className="space-y-4">
              <Label>Audios (optional)</Label>
              {audios.map((audio, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    type="text"
                    placeholder="Language (e.g. English)"
                    value={audio.language}
                    onChange={(e) =>
                      handleLanguageChange(index, e.target.value)
                    }
                  />
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={(e) =>
                      handleAudioChange(index, e.target.files?.[0] ?? null)
                    }
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addAudioField}>
                + Add Another Audio
              </Button>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Item"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
