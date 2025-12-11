// src/app/(dashboard)/topics/columns.tsx
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
export type Topic = {
  id: string;
  courseId: number;
  title: string;
  serialId: number;
  description: string;
  pdfLink: string | null;
  other: string | null;
  image: string | null;
  video: string | null;
  courseName: string;
};

const BASE_URL = "https://course-selling-app.saveneed.com";

// === COLUMNS ===
export const topicColumns: ColumnDef<Topic>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "courseName", header: "Course" },
  { accessorKey: "serialId", header: "Serial ID" },
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
      const topic = row.original;
      return (
        <div className="flex gap-2">
          <ViewTopicModal topic={topic} />
          <EditTopicModal topic={topic} />
          <DeleteTopicModal topic={topic} />
        </div>
      );
    },
  },
];

// =============== VIEW MODAL ===============
function ViewTopicModal({ topic }: { topic: Topic }) {
  const [isOpen, setIsOpen] = useState(false);
  const [courseName, setCourseName] = useState<string>("Loading...");

  useEffect(() => {
    if (!isOpen) {
      setCourseName("Loading...");
      return;
    }

    const fetchCourseName = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token");

        const res = await fetch(`${BASE_URL}/api/courses/${topic.courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          setCourseName(json?.course?.name || "Unknown Course");
        } else {
          setCourseName("Not Found");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setCourseName("Error");
      }
    };

    fetchCourseName();
  }, [isOpen, topic.courseId]);

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
            <DialogTitle className="text-2xl">{topic.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Course: <strong>{courseName}</strong> • Topic ID: {topic.id}
            </p>
          </DialogHeader>

          {/* Header Card */}
          <div className="border rounded-lg p-6 mb-6 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-48 md:h-48">
                {topic.image ? (
                  <div className="w-full h-full relative rounded-lg overflow-hidden border">
                    <Image
                      src={topic.image.trim()}
                      alt={topic.title}
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
                <h3 className="font-semibold text-lg">Topic Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <span>
                    <strong>ID:</strong> {topic.id}
                  </span>
                  <span>
                    <strong>Serial ID:</strong> {topic.serialId}
                  </span>
                  <span>
                    <strong>Course:</strong> {courseName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <Label>Description</Label>
              <p className="text-sm leading-relaxed mt-1">
                {topic.description}
              </p>
            </div>

            {topic.image && (
              <div>
                <Label>Image</Label>
                <div className="mt-2 w-full h-40 relative rounded border">
                  <Image
                    src={topic.image.trim()}
                    alt="Topic visual"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {topic.video && (
              <div>
                <Label>Video</Label>
                <video controls className="w-full h-40 rounded mt-2">
                  <source src={topic.video.trim()} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {topic.pdfLink && (
              <div>
                <Label>PDF Material</Label>
                <a
                  href={topic.pdfLink.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline block"
                >
                  📄 Open PDF
                </a>
              </div>
            )}

            {topic.other && (
              <div>
                <Label>Notes</Label>
                <p className="text-sm italic text-orange-600">{topic.other}</p>
              </div>
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

// =============== EDIT MODAL ===============
function EditTopicModal({ topic }: { topic: Topic }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: topic.title,
    serialId: String(topic.serialId),
    description: topic.description,
    pdfLink: topic.pdfLink || "",
    other: topic.other || "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(topic.image);
  const [videoPreview, setVideoPreview] = useState<string | null>(topic.video);
  const [courseName, setCourseName] = useState<string>("Loading...");
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCourseName = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`${BASE_URL}/api/courses/${topic.courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          setCourseName(json?.course?.name || "Unknown Course");
        } else {
          setCourseName("Not Found");
        }
      } catch (err) {
        console.error(err);
        setCourseName("Error");
      }
    };

    fetchCourseName();
  }, [isOpen, topic.courseId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("serial_id", formData.serialId);
      fd.append("description", formData.description);
      fd.append("pdf_link", formData.pdfLink);
      fd.append("other", formData.other);
      fd.append("course_id", String(topic.courseId));

      if (imageFile) fd.append("image", imageFile);
      if (videoFile) fd.append("video", videoFile);

      const res = await fetch(`${BASE_URL}/api/topics/${topic.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        alert("Saved successfully!");
        window.location.reload();
      } else {
        alert("Save failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
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
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Topic: {topic.title}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Course: <strong>{courseName}</strong>
            </p>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Title *</Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Serial ID</Label>
                <Input
                  name="serialId"
                  type="number"
                  value={formData.serialId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>PDF Link</Label>
                <Input
                  name="pdfLink"
                  value={formData.pdfLink}
                  onChange={handleChange}
                  placeholder="https://example.com/doc.pdf"
                />
              </div>
              <div>
                <Label>Other Notes</Label>
                <Input
                  name="other"
                  value={formData.other}
                  onChange={handleChange}
                  placeholder="e.g., Watch full video"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Image (Current or Replace)</Label>
              {imagePreview && (
                <div className="mb-2 w-full h-32 relative rounded border">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={imageRef}
                className="mt-1"
              />
            </div>

            {/* Video Upload */}
            <div>
              <Label>Video (Replace)</Label>
              {videoPreview && (
                <div className="mb-2 w-full h-40 relative rounded border bg-black">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                ref={videoRef}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =============== DELETE MODAL ===============
function DeleteTopicModal({ topic }: { topic: Topic }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/topics/${topic.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Network error.");
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
            <DialogTitle>Delete Topic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{topic.title}</strong>?
              This cannot be undone.
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
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
