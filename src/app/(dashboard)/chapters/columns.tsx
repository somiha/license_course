// src/app/(dashboard)/chapters/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Eye } from "lucide-react";
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
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

// === TYPES ===
export type Chapter = {
  id: string;
  topicId: number;
  title: string;
  image: string | null;
  topicName: string;
};

interface ChapterDetail {
  id: number;
  chapter_id: number;
  title: string;
  serial_id: number;
  description: string;
  pdf_link: string | null;
  image: string | null;
  video: string | null;
  other: string | null;
}

const BASE_URL = "https://course-selling-app.saveneed.com";

// === COLUMNS ===
export const chapterColumns: ColumnDef<Chapter>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "topicName", header: "Topic" },
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.original.image?.trim();
      if (!imageUrl)
        return <span className="text-muted-foreground">No image</span>;
      return (
        <div className="w-16 h-16 relative rounded overflow-hidden border">
          <Image
            src={imageUrl}
            alt={row.original.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const chapter = row.original;
      return (
        <div className="flex gap-2">
          <ViewChapterDetails chapter={chapter} />
          <EditChapterModal chapter={chapter} />
          <DeleteChapterModal chapter={chapter} />
        </div>
      );
    },
  },
];

function ViewChapterDetails({ chapter }: { chapter: Chapter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<ChapterDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [topicName, settopicName] = useState<string>("Loading...");

  useEffect(() => {
    if (!isOpen) {
      // Reset on close
      setDetails([]);
      settopicName("Loading...");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token");

        // Fetch lesson items
        const detailsRes = await fetch(
          `${BASE_URL}/api/chapter-details/chapter/${chapter.id}?page=1&limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!detailsRes.ok) {
          // If non-OK, ensure details empty and continue to topic fetch
          console.error("Failed to load lesson items:", detailsRes.statusText);
          setDetails([]);
        } else {
          const detailsJson = await detailsRes.json();

          let validDetails: ChapterDetail[] = [];

          // Defensive checks: remote shape might be { details: [...] } or [...] directly
          const maybeArray = Array.isArray(detailsJson)
            ? detailsJson
            : Array.isArray(detailsJson?.details)
            ? detailsJson.details
            : null;

          if (Array.isArray(maybeArray)) {
            validDetails = maybeArray
              .filter((item): item is ChapterDetail => {
                return (
                  item != null &&
                  typeof item.id === "number" &&
                  typeof item.serial_id === "number" &&
                  typeof item.title === "string"
                );
              })
              .sort((a, b) => a.serial_id - b.serial_id);
          }

          setDetails(validDetails);
        }

        // Fetch topic name
        if (chapter.topicId) {
          const topicRes = await fetch(
            `${BASE_URL}/api/topics/${chapter.topicId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (topicRes.ok) {
            const json = await topicRes.json();
            settopicName(json?.topic?.name || "Unknown topic");
          } else {
            settopicName("Not Found");
          }
        } else {
          settopicName("Not Found");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        settopicName("Error");
        setDetails([]); // be safe
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, chapter.id, chapter.topicId]);

  return (
    <>
      <Button
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{chapter.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              topic: <strong>{topicName}</strong> • Chapter ID: {chapter.id}
            </p>
          </DialogHeader>

          {/* Header Card */}
          <div className="border rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-48 md:h-48">
                {chapter.image ? (
                  <div className="w-full h-full relative rounded-lg overflow-hidden border">
                    <Image
                      src={chapter.image.trim()}
                      alt={chapter.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted rounded flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="font-semibold text-lg">Chapter Overview</h3>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <span>
                    <strong>ID:</strong> {chapter.id}
                  </span>
                  <span>
                    <strong>Chapter Name:</strong> {chapter.title}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Items */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg border-b pb-2">Lesson Items</h4>
            {loading ? (
              <p className="text-center py-4 text-muted-foreground">
                Loading...
              </p>
            ) : details.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                No items yet.
              </p>
            ) : (
              details.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-5 space-y-4 bg-white dark:bg-gray-700 shadow-sm"
                >
                  <div className="flex justify-between">
                    <div>
                      <h5 className="font-bold text-primary">
                        #{item.serial_id} {item.title}
                      </h5>
                      <p className="text-xs text-gray-500">ID: {item.id}</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                      Serial #{item.serial_id}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {item.image && (
                      <div>
                        <Label>Image</Label>
                        <div className="mt-2 w-full h-40 relative rounded border">
                          <Image
                            src={item.image.trim()}
                            alt={item.title}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}

                    {item.video && (
                      <div>
                        <Label>Video</Label>
                        <video controls className="w-full h-40 rounded mt-2">
                          <source src={item.video.trim()} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {item.pdf_link && (
                      <a
                        href={item.pdf_link.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        📄 PDF Material
                      </a>
                    )}
                    {item.other && (
                      <p className="italic text-orange-600">
                        Note: {item.other}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =============== EDIT MODAL (Full Editable + topic Name) ===============
function EditChapterModal({ chapter }: { chapter: Chapter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chapterData, setChapterData] = useState({
    title: chapter.title,
    topicId: chapter.topicId.toString(),
  });
  const [details, setDetails] = useState<ChapterDetail[]>([]);
  const [topicName, settopicName] = useState<string>("Loading...");
  const chapterImageRef = useRef<HTMLInputElement>(null);
  const detailFileRefs = useRef<{
    [key: number]: { image?: File; video?: File };
  }>({});

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        // Fetch chapter-details
        const detailsRes = await fetch(
          `${BASE_URL}/api/chapter-details?chapter_id=${chapter.id}&page=1&limit=50`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (detailsRes.ok) {
          const detailsJson = await detailsRes.json();

          const maybeArray = Array.isArray(detailsJson)
            ? detailsJson
            : Array.isArray(detailsJson?.details)
            ? detailsJson.details
            : null;

          let validDetails: ChapterDetail[] = [];

          if (Array.isArray(maybeArray)) {
            validDetails = maybeArray
              .filter((item): item is ChapterDetail => {
                return (
                  item != null &&
                  typeof item.id === "number" &&
                  typeof item.serial_id === "number" &&
                  typeof item.title === "string"
                );
              })
              .sort((a, b) => a.serial_id - b.serial_id);
          }

          setDetails(validDetails);
        } else {
          setDetails([]);
        }

        // Fetch topic name
        if (chapter.topicId) {
          const topicRes = await fetch(
            `${BASE_URL}/api/topics/${chapter.topicId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (topicRes.ok) {
            const json = await topicRes.json();
            settopicName(json?.topic?.name || "Unknown topic");
          } else {
            settopicName("Not Found");
          }
        } else {
          settopicName("Not Found");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        settopicName("Error");
        setDetails([]);
      }
    };
    fetchData();
  }, [isOpen, chapter.id, chapter.topicId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChapterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (
    id: number,
    field: keyof Omit<ChapterDetail, "id" | "chapter_id">,
    value: string | number | null
  ) => {
    setDetails((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleFileSelect = (detailId: number, type: "image" | "video") => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Update preview URL (keep previous string if already url)
      setDetails((prev) =>
        prev.map((d) =>
          d.id === detailId ? { ...d, [type]: URL.createObjectURL(file) } : d
        )
      );

      // Store actual file for upload
      if (!detailFileRefs.current[detailId]) {
        detailFileRefs.current[detailId] = {};
      }
      detailFileRefs.current[detailId][type] = file;
    };
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      // Update main chapter
      const formData = new FormData();
      formData.append("title", chapterData.title);
      formData.append("topic_id", chapterData.topicId);

      const imgFile = chapterImageRef.current?.files?.[0];
      if (imgFile) formData.append("image", imgFile);

      await fetch(`${BASE_URL}/api/chapters/${chapter.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      // Update each chapter-detail
      for (const item of details) {
        const fd = new FormData();
        fd.append("title", item.title ?? "");
        fd.append("serial_id", String(item.serial_id ?? ""));
        fd.append("description", item.description ?? "");
        fd.append("pdf_link", item.pdf_link ?? "");
        fd.append("other", item.other ?? "");

        const savedImage = detailFileRefs.current[item.id]?.image;
        const savedVideo = detailFileRefs.current[item.id]?.video;

        if (savedImage) fd.append("image", savedImage);
        if (savedVideo) fd.append("video", savedVideo);

        await fetch(`${BASE_URL}/api/chapter-details/${item.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
      }

      alert("Saved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Save failed:", error);
      alert("An error occurred while saving.");
    }
  };

  return (
    <>
      <Button
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Chapter: {chapter.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Belongs to topic: <strong>{topicName}</strong>
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Chapter Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Title</Label>
                <Input
                  name="title"
                  value={chapterData.title}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label>topic ID</Label>
                <Input
                  name="topicId"
                  type="number"
                  value={chapterData.topicId}
                  onChange={handleChange}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  topic: <strong>{topicName}</strong>
                </p>
              </div>
            </div>

            <div>
              <Label>Thumbnail (Optional)</Label>
              <Input
                type="file"
                ref={chapterImageRef}
                accept="image/*"
                className="mt-1"
              />
            </div>

            {/* Lesson Items */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">
                Lesson Items ({details.length})
              </h4>
              {details.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No items to edit.
                </p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                  {details.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 border rounded bg-gray-50 dark:bg-gray-800 space-y-3"
                    >
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label>Serial</Label>
                          <Input
                            type="number"
                            value={item.serial_id}
                            onChange={(e) =>
                              handleDetailChange(
                                item.id,
                                "serial_id",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Title</Label>
                          <Input
                            value={item.title}
                            onChange={(e) =>
                              handleDetailChange(
                                item.id,
                                "title",
                                e.target.value
                              )
                            }
                            className="h-8"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            handleDetailChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          rows={2}
                          className="w-full p-2 border rounded text-sm"
                        />
                      </div>

                      <div>
                        <Label>PDF Link</Label>
                        <Input
                          value={item.pdf_link || ""}
                          onChange={(e) =>
                            handleDetailChange(
                              item.id,
                              "pdf_link",
                              e.target.value
                            )
                          }
                          placeholder="https://example.com/doc.pdf"
                          className="h-8"
                        />
                      </div>

                      <div>
                        <Label>Other Notes</Label>
                        <Input
                          value={item.other || ""}
                          onChange={(e) =>
                            handleDetailChange(item.id, "other", e.target.value)
                          }
                          placeholder="e.g., Watch full video"
                          className="h-8"
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <Label>Image</Label>
                        {item.image && (
                          <div className="mb-2 w-full h-20 relative rounded border">
                            <Image
                              src={item.image}
                              alt="Current"
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect(item.id, "image")}
                          className="mt-1"
                        />
                      </div>

                      {/* Video Upload */}
                      <div>
                        <Label>Video</Label>
                        {item.video && (
                          <div className="mb-2">
                            <video controls className="w-full h-20 rounded">
                              <source src={item.video} type="video/mp4" />
                              Not supported.
                            </video>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={handleFileSelect(item.id, "video")}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
            >
              Save All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =============== DELETE MODAL ===============
function DeleteChapterModal({ chapter }: { chapter: Chapter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/chapters/${chapter.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        window.location.reload();
      } else {
        console.error("Delete failed:", res.statusText);
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
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Trash className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chapter</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{chapter.title}</strong>?
              All lesson items will be removed.
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
              className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
