// src/app/(dashboard)/item-contents/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash,
  Eye,
  Globe,
  FileImage,
  FileVideo,
  FileAudio,
  X,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const BASE_URL = "https://course-selling-app.saveneed.com";

// ================= Interfaces =================
interface ContentLang {
  id?: string | number;
  language: string;
  content: string;
}

export interface ItemAudio {
  id: number;
  audio: string;
  language: string;
  item_contents_id: number;
}

export interface ItemContent {
  id: number;
  chapter_details_id: number;
  content: string | null;
  content_and_language: string | ContentLang[] | null;
  image: string | null;
  video: string | null;
  audios: ItemAudio[];
}

export type ContentItem = ItemContent;

// API Response Types
interface AudiosApiResponse {
  audios: ItemAudio[];
}

// === Type Guards ===
function isContentLang(obj: object): obj is ContentLang {
  const contentLang = obj as ContentLang;
  return (
    typeof contentLang.language === "string" &&
    typeof contentLang.content === "string" &&
    contentLang.language.trim() !== "" &&
    contentLang.content.trim() !== ""
  );
}

function isContentLangArray(
  data: string | object[] | null
): data is ContentLang[] {
  if (Array.isArray(data)) {
    return data.every(isContentLang);
  }
  return false;
}

function isAudiosApiResponse(data: object): data is AudiosApiResponse {
  const response = data as AudiosApiResponse;
  return Array.isArray(response.audios);
}

// === Parse Safely ===
function parseContentAndLanguage(
  raw: string | ContentLang[] | null
): ContentLang[] {
  if (isContentLangArray(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    try {
      const parsed: object = JSON.parse(raw);
      if (Array.isArray(parsed) && isContentLangArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to parse content_and_language", e);
    }
  }

  return [];
}

// Helper: Normalize language names
function getLanguageName(code: string): string {
  const normalized = code.toLowerCase().trim();
  const map: Record<string, string> = {
    en: "English",
    english: "English",
    es: "Spanish",
    spanish: "Spanish",
    fr: "French",
    french: "French",
    de: "German",
    german: "German",
    hi: "Hindi",
    hindi: "Hindi",
    bn: "Bengali",
    bengali: "Bengali",
    ar: "Arabic",
    arabic: "Arabic",
    zh: "Chinese",
    chinese: "Chinese",
    ja: "Japanese",
    japanese: "Japanese",
    ko: "Korean",
    korean: "Korean",
  };
  return map[normalized] || code.charAt(0).toUpperCase() + code.slice(1);
}

// ================= View Modal =================
export function ViewDetailModal({ detail }: { detail: ItemContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [audios, setAudios] = useState<ItemAudio[]>([]);
  const [loading, setLoading] = useState(false);

  const parsedContentAndLanguage = parseContentAndLanguage(
    detail.content_and_language
  );

  useEffect(() => {
    if (!isOpen) return;

    const fetchAudios = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token");

        const res = await fetch(
          `${BASE_URL}/api/item-audios?page=1&limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch audios");

        const rawData: AudiosApiResponse = await res.json();

        if (isAudiosApiResponse(rawData)) {
          const filtered = rawData.audios.filter(
            (a) => a.item_contents_id === detail.id
          );
          setAudios(filtered);
        }
      } catch (err) {
        console.error("Fetch audios error:", err);
        setAudios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudios();
  }, [isOpen, detail.id]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Content #{detail.id}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Chapter Detail ID: {detail.chapter_details_id}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Fallback Content */}
            {detail.content?.trim() && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Content</Label>
                <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                  {detail.content}
                </p>
              </div>
            )}

            {/* Multilingual Content */}
            {parsedContentAndLanguage.length > 0 ? (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Multilingual Content
                </Label>
                <div className="space-y-3">
                  {parsedContentAndLanguage.map((langItem, idx) => (
                    <div
                      key={langItem.id ?? idx}
                      className="border-l-4 border-blue-200 pl-3 bg-blue-50 p-3 rounded"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm text-blue-800 capitalize">
                          {getLanguageName(langItem.language)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {langItem.language.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {langItem.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              !detail.content?.trim() && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No content available
                </p>
              )
            )}

            {/* Image */}
            {detail.image && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Image</Label>
                <div className="w-full h-48 relative rounded overflow-hidden border">
                  <Image
                    src={detail.image}
                    alt={`Content ${detail.id}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Video */}
            {detail.video && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Video</Label>
                <video controls className="w-full rounded border">
                  <source src={detail.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Audios */}
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">
                  Loading audios...
                </p>
              </div>
            ) : audios.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Audios</Label>
                <div className="space-y-2">
                  {audios.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded border"
                    >
                      <FileAudio className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium flex-1">
                        {getLanguageName(a.language)}
                      </span>
                      <audio controls className="flex-1 h-8">
                        <source src={a.audio} type="audio/mpeg" />
                      </audio>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No audio recordings
              </p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsOpen(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ================= Edit Modal =================
function EditDetailModal({ detail }: { detail: ItemContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    content: detail.content || "",
  });

  const [contentAndLanguage, setContentAndLanguage] = useState<ContentLang[]>(
    parseContentAndLanguage(detail.content_and_language).length > 0
      ? parseContentAndLanguage(detail.content_and_language)
      : [{ id: Date.now().toString(), language: "", content: "" }]
  );

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [audios, setAudios] = useState<ItemAudio[]>([]);
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [newAudioLang, setNewAudioLang] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(detail.image);
  const [videoPreview, setVideoPreview] = useState<string | null>(detail.video);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAudios = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const res = await fetch(
          `${BASE_URL}/api/item-audios?page=1&limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) return;

        const rawData: AudiosApiResponse = await res.json();

        if (isAudiosApiResponse(rawData)) {
          const filtered = rawData.audios.filter(
            (a) => a.item_contents_id === detail.id
          );
          setAudios(filtered);
        }
      } catch (err) {
        console.error(err);
        setAudios([]);
      }
    };

    fetchAudios();
  }, [isOpen, detail.id]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setNewImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle video change
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setNewVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  // Clear image
  const handleClearImage = () => {
    setNewImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Clear video
  const handleClearVideo = () => {
    setNewVideoFile(null);
    setVideoPreview(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleDeleteAudio = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/item-audios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAudios((prev) => prev.filter((a) => a.id !== id));
      } else {
        alert("Failed to delete audio.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const addLanguageField = () => {
    setContentAndLanguage((prev) => [
      ...prev,
      { id: Date.now().toString(), language: "", content: "" },
    ]);
  };

  const removeLanguageField = (index: number) => {
    if (contentAndLanguage.length > 1) {
      setContentAndLanguage((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateLanguageField = (
    index: number,
    field: "language" | "content",
    value: string
  ) => {
    setContentAndLanguage((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    if (
      !formData.content.trim() &&
      contentAndLanguage.every((c) => !c.content?.trim())
    ) {
      alert("Please provide at least one version of content.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("content", formData.content);

      const validTranslations = contentAndLanguage.filter(
        (item) => item.language.trim() && item.content?.trim()
      );
      form.append("content_and_language", JSON.stringify(validTranslations));

      // Append new image if selected
      if (newImageFile) {
        form.append("image", newImageFile);
      }

      // Append new video if selected
      if (newVideoFile) {
        form.append("video", newVideoFile);
      }

      if (newAudioFile && newAudioLang.trim()) {
        form.append("audio", newAudioFile);
        form.append("language", newAudioLang);
      }

      const res = await fetch(`${BASE_URL}/api/item-contents/${detail.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      const result = await res.json();

      if (!res.ok) {
        let errorMsg = "Update failed";
        if (result && typeof result.message === "string") {
          errorMsg = result.message;
        }
        throw new Error(errorMsg);
      }

      alert("Saved successfully!");
      window.location.reload();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 border-green-200 hover:bg-green-50 hover:text-green-700 transition-colors"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-green-600" />
              Edit Content #{detail.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Fallback Content */}
            <div className="space-y-2">
              <Label>Default Content (Optional)</Label>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={3}
                placeholder="Used when no language matches..."
                className="resize-y"
              />
            </div>

            {/* Multilingual Editor */}
            <div className="space-y-3">
              <Label>Multilingual Content</Label>
              <div className="space-y-3">
                {contentAndLanguage.map((langItem, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-3 p-3 border rounded"
                  >
                    <div className="col-span-1 space-y-1">
                      <Label className="text-xs">Language</Label>
                      <Input
                        placeholder="en"
                        value={langItem.language}
                        onChange={(e) =>
                          updateLanguageField(idx, "language", e.target.value)
                        }
                        className="h-9"
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Content</Label>
                      <Textarea
                        placeholder="Translation..."
                        value={langItem.content}
                        onChange={(e) =>
                          updateLanguageField(idx, "content", e.target.value)
                        }
                        rows={2}
                        className="resize-y min-h-[60px]"
                      />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLanguageField(idx)}
                        disabled={contentAndLanguage.length <= 1}
                        className="h-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLanguageField}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Replace Image</Label>
              <div className="flex items-center gap-3">
                {(imagePreview || detail.image) && (
                  <div className="w-16 h-16 relative rounded border">
                    <Image
                      src={imagePreview || detail.image!}
                      alt="Preview"
                      fill
                      className="object-cover rounded"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {(imagePreview || detail.image) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearImage}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <Label>Replace Video</Label>
              <div className="flex items-center gap-3">
                {(videoPreview || detail.video) && (
                  <div className="w-24 h-16 bg-gray-100 rounded border flex items-center justify-center">
                    <FileVideo className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                  {(videoPreview || detail.video) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearVideo}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove Video
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Existing Audios */}
            <div className="space-y-2">
              <Label>Existing Audios</Label>
              {audios.length > 0 ? (
                <div className="space-y-2">
                  {audios.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 p-2 border rounded"
                    >
                      <FileAudio className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium flex-1">
                        {getLanguageName(a.language)}
                      </span>
                      <audio controls className="flex-1 h-8">
                        <source src={a.audio} type="audio/mpeg" />
                      </audio>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAudio(a.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No audio recordings
                </p>
              )}
            </div>

            {/* Add New Audio */}
            <div className="space-y-2">
              <Label>Add New Audio</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Language"
                  value={newAudioLang}
                  onChange={(e) => setNewAudioLang(e.target.value)}
                />
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    setNewAudioFile(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ================= Delete Modal =================
function DeleteDetailModal({ detail }: { detail: ItemContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/item-contents/${detail.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Delete failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors"
      >
        <Trash className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash className="h-5 w-5" />
              Delete Content
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete Content #{detail.id}? This action
              cannot be undone.
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

// ================= Table Columns =================
export const detailColumns: ColumnDef<ContentItem>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 80,
  },
  {
    accessorKey: "chapter_details_id",
    header: "Chapter Detail ID",
    size: 150,
  },
  {
    header: "Content Preview",
    cell: ({ row }) => {
      const item = row.original;
      const parsed = parseContentAndLanguage(item.content_and_language);
      const preview = parsed[0]?.content || item.content || "No content";
      return (
        <div className="max-w-xs">
          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
            {preview}
          </p>
        </div>
      );
    },
    size: 300,
  },
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.original.image;
      if (!imageUrl)
        return (
          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
            <FileImage className="h-5 w-5 text-gray-400" />
          </div>
        );

      return (
        <div className="w-16 h-16 relative rounded overflow-hidden border">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      );
    },
    size: 100,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const detail = row.original;
      return (
        <div className="flex gap-1">
          <ViewDetailModal detail={detail} />
          <EditDetailModal detail={detail} />
          <DeleteDetailModal detail={detail} />
        </div>
      );
    },
    size: 140,
  },
];
