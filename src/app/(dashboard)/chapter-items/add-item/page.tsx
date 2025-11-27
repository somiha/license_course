// src/app/(dashboard)/item-contents/add/page.tsx
"use client";

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import {
  Plus,
  Trash2,
  Upload,
  FileVideo,
  FileAudio,
  FileImage,
  Globe,
  BookOpen,
  Languages,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const BASE_URL = "https://course-selling-app.saveneed.com";

// === TYPES ===
interface ChapterDetail {
  id: number;
  title: string;
}

interface AudioInput {
  file: File | null;
  language: string;
}

interface ContentLang {
  id: string;
  language: string;
  content: string;
}

interface ApiResponse {
  content: {
    id: number;
    chapter_details_id: number;
    content: string;
    content_and_language: ContentLang[];
    image: string | null;
    video: string | null;
    created_at: string;
    updated_at: string;
  };
}

export default function AddItemPage() {
  const [chapterDetails, setChapterDetails] = useState<ChapterDetail[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [content, setContent] = useState("");
  const [contentAndLanguage, setContentAndLanguage] = useState<ContentLang[]>([
    { id: uuidv4(), language: "", content: "" },
  ]);
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

  // Language options for suggestions
  const languageSuggestions = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "hi", name: "Hindi" },
    { code: "bn", name: "Bengali" },
    { code: "ar", name: "Arabic" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
  ];

  // ✅ Fetch chapter details for dropdown
  useEffect(() => {
    const fetchChapterDetails = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/chapter-details?page=1&limit=50`
        );

        if (!res.ok) {
          toast.error("Failed to load chapter details");
          return;
        }

        const data = await res.json();

        if (Array.isArray(data.details)) {
          setChapterDetails(data.details);
        } else {
          toast.error("Invalid data format received");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Network error while loading chapters");
      }
    };

    fetchChapterDetails();
  }, []);

  // ✅ Handle file inputs
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Audio handlers
  const handleAudioChange = (index: number, file: File | null) => {
    setAudios((prev) =>
      prev.map((audio, i) => (i === index ? { ...audio, file } : audio))
    );
  };

  const handleLanguageChange = (index: number, language: string) => {
    setAudios((prev) =>
      prev.map((audio, i) => (i === index ? { ...audio, language } : audio))
    );
  };

  const addAudioField = () => {
    setAudios((prev) => [...prev, { file: null, language: "" }]);
  };

  const removeAudioField = (index: number) => {
    if (audios.length > 1) {
      setAudios((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // ✅ Multilingual Content Handlers
  const handleLangContentChange = (idx: number, value: string) => {
    setContentAndLanguage((prev) =>
      prev.map((lang, i) => (i === idx ? { ...lang, content: value } : lang))
    );
  };

  const handleLangCodeChange = (idx: number, code: string) => {
    setContentAndLanguage((prev) =>
      prev.map((lang, i) => (i === idx ? { ...lang, language: code } : lang))
    );
  };

  const addLanguageField = () => {
    setContentAndLanguage((prev) => [
      ...prev,
      { id: uuidv4(), language: "", content: "" },
    ]);
  };

  const removeLanguageField = (index: number) => {
    if (contentAndLanguage.length > 1) {
      setContentAndLanguage((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const getLanguageName = (code: string): string => {
    const lang = languageSuggestions.find((l) => l.code === code.toLowerCase());
    return lang ? lang.name : code.toUpperCase();
  };

  // ✅ Validate before submit
  const isValidContent = (): boolean => {
    return (
      content.trim() !== "" ||
      contentAndLanguage.some(
        (item) => item.content.trim() !== "" && item.language.trim() !== ""
      )
    );
  };

  // ✅ Submit all data
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedChapterId) {
      toast.error("Please select a chapter detail");
      return;
    }

    if (!isValidContent()) {
      toast.error(
        "At least one content field (main or multilingual) is required"
      );
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("chapter_details_id", selectedChapterId);
      formData.append("content", content);
      formData.append(
        "content_and_language",
        JSON.stringify(contentAndLanguage)
      );

      if (imageFile) formData.append("image", imageFile);
      if (videoFile) formData.append("video", videoFile);

      const contentRes = await fetch(`${BASE_URL}/api/item-contents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result: unknown = await contentRes.json();

      if (!contentRes.ok) {
        const error = result as { message?: string };
        throw new Error(error.message || "Failed to upload content");
      }

      const apiResponse = result as ApiResponse;
      const contentId = apiResponse.content.id;

      // Submit Audios
      const audioUploads = audios
        .filter((audio) => audio.file && audio.language.trim())
        .map(async (audio) => {
          const audioForm = new FormData();
          audioForm.append("item_contents_id", String(contentId));
          audioForm.append("audio", audio.file!);
          audioForm.append("language", audio.language);

          await fetch(`${BASE_URL}/api/item-audios`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: audioForm,
          });
        });

      await Promise.all(audioUploads);

      toast.success("Item content & audios added successfully!");

      // Reset form
      setContent("");
      setContentAndLanguage([{ id: uuidv4(), language: "en", content: "" }]);
      setImageFile(null);
      setVideoFile(null);
      setImagePreview(null);
      setVideoPreview(null);
      setAudios([{ file: null, language: "" }]);
      setSelectedChapterId("");
    } catch (error) {
      console.error("Submission error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong while saving data");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create New Content
        </h1>
      </div>

      <Card className="w-full shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
            <BookOpen className="h-6 w-6 text-blue-600" />
            Content Form
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Chapter Detail Select */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Chapter Selection
              </Label>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
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

            <Separator />

            {/* Main Fallback Content */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Content</Label>
              <p className="text-sm text-gray-500 mb-3">
                This content will be used when no specific language translation
                is available
              </p>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your main content here. This serves as a fallback for unsupported languages..."
                rows={4}
                className="min-h-[120px] resize-y border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              />
            </div>

            <Separator />

            {/* Multilingual Content - Beautiful Design */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <Languages className="h-5 w-5 text-green-600" />
                  Multilingual Content
                </Label>
                <Badge variant="secondary" className="text-sm">
                  {contentAndLanguage.length} language(s)
                </Badge>
              </div>

              <p className="text-sm text-gray-500">
                Add content in multiple languages. At least one language must be
                provided.
              </p>

              <div className="space-y-4">
                {contentAndLanguage.map((langItem, idx) => (
                  <Card
                    key={langItem.id}
                    className="border-2 border-gray-100 hover:border-green-200 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Globe className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-700">
                            Translation #{idx + 1}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLanguageField(idx)}
                          disabled={contentAndLanguage.length <= 1}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-1 space-y-2">
                          <Label className="text-sm font-medium">
                            Language Code *
                          </Label>
                          <div className="space-y-2">
                            <Input
                              value={langItem.language}
                              onChange={(e) =>
                                handleLangCodeChange(idx, e.target.value)
                              }
                              placeholder=""
                              className="border-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                              required
                            />
                            {langItem.language && (
                              <Badge variant="outline" className="text-xs">
                                {getLanguageName(langItem.language)}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="lg:col-span-3 space-y-2">
                          <Label className="text-sm font-medium">
                            Content *
                          </Label>
                          <Textarea
                            value={langItem.content}
                            onChange={(e) =>
                              handleLangContentChange(idx, e.target.value)
                            }
                            placeholder={`Enter content in ${
                              getLanguageName(langItem.language) ||
                              "this language"
                            }...`}
                            rows={3}
                            className="min-h-[80px] resize-y border-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addLanguageField}
                className="w-full border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Language
              </Button>
            </div>

            <Separator />

            {/* Media Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Upload */}
              <Card className="border-2 border-gray-100">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileImage className="h-5 w-5 text-purple-600" />
                    Image Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-purple-200">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-dashed border-purple-200 flex flex-col items-center justify-center text-purple-400">
                        <FileImage className="h-12 w-12 mb-2" />
                        <p className="text-sm font-medium">No image selected</p>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
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
                </CardContent>
              </Card>

              {/* Video Upload */}
              <Card className="border-2 border-gray-100">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileVideo className="h-5 w-5 text-orange-600" />
                    Video Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    {videoPreview ? (
                      <div className="w-full h-48 rounded-lg overflow-hidden border-2 border-orange-200">
                        <video
                          controls
                          className="w-full h-full object-cover"
                          src={videoPreview}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-dashed border-orange-200 flex flex-col items-center justify-center text-orange-400">
                        <FileVideo className="h-12 w-12 mb-2" />
                        <p className="text-sm font-medium">No video selected</p>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => videoInputRef.current?.click()}
                      className="border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
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
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Audio Upload Section */}
            <Card className="border-2 border-gray-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileAudio className="h-5 w-5 text-indigo-600" />
                  Audio Translations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-gray-500">
                  Add audio files for different language pronunciations
                </p>

                <div className="space-y-4">
                  {audios.map((audio, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Language
                          </Label>
                          <Input
                            type="text"
                            placeholder="e.g., English"
                            value={audio.language}
                            onChange={(e) =>
                              handleLanguageChange(index, e.target.value)
                            }
                            className="border-2 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Audio File
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="audio/*"
                              onChange={(e) =>
                                handleAudioChange(
                                  index,
                                  e.target.files?.[0] ?? null
                                )
                              }
                              className="border-2 focus:border-indigo-500"
                            />
                            {audios.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAudioField(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={addAudioField}
                  className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Audio Translation
                </Button>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="px-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Content...
                  </>
                ) : (
                  "Create Content"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
