"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

const BASE_URL = "https://course-selling-app.saveneed.com";

export default function AddChapterPage() {
  // ===============================
  // Chapter form states
  // ===============================
  const [chapterForm, setChapterForm] = useState({
    title: "",
    topicId: "",
  });
  const [chapterImage, setChapterImage] = useState<File | null>(null);
  const [chapterImagePreview, setChapterImagePreview] = useState<string | null>(
    null
  );
  const [isSubmittingChapter, setIsSubmittingChapter] = useState(false);
  const chapterFileRef = useRef<HTMLInputElement>(null);

  // ===============================
  // Chapter details form states
  // ===============================
  const [detailForm, setDetailForm] = useState({
    chapterId: "",
    title: "",
    serialId: "",
    description: "",
    pdfLink: "",
    other: "",
  });
  const [detailImage, setDetailImage] = useState<File | null>(null);
  const [detailVideo, setDetailVideo] = useState<File | null>(null);
  const [detailImagePreview, setDetailImagePreview] = useState<string | null>(
    null
  );
  const [detailVideoPreview, setDetailVideoPreview] = useState<string | null>(
    null
  );
  const [isSubmittingDetail, setIsSubmittingDetail] = useState(false);
  const [chapters, setChapters] = useState<{ id: number; title: string }[]>([]);
  const [topics, setTopics] = useState<{ id: number; title: string }[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ===============================
  // Fetch chapters for dropdown
  // ===============================
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/chapters`);
        const data = await res.json();
        if (res.ok && data.chapters) {
          setChapters(data.chapters);
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };
    fetchChapters();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/topics`);
        const data = await res.json();
        if (res.ok && data.details) {
          setTopics(data.details);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };
    fetchCourses();
  }, []);

  // ===============================
  // Handlers
  // ===============================
  const handleInputChange = <
    T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >(
    e: React.ChangeEvent<T>
  ) => {
    const { name, value } = e.target;
    if (name in chapterForm) {
      setChapterForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setDetailForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Restrict title input (only letters and spaces)
  const handleDetailTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = e.target;
    const validValue = value.replace(/[^A-Za-z\s]/g, ""); // only letters + spaces
    setDetailForm((prev) => ({ ...prev, title: validValue }));
  };

  const handleChapterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChapterImage(file);
      setChapterImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDetailImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDetailImage(file);
      setDetailImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDetailVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDetailVideo(file);
      setDetailVideoPreview(URL.createObjectURL(file));
    }
  };

  // ===============================
  // Submit Chapter
  // ===============================
  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chapterForm.title.trim() || !chapterForm.topicId.trim()) {
      toast.error("All fields are required");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmittingChapter(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", chapterForm.title);
      formDataToSend.append("topic_id", chapterForm.topicId);
      if (chapterImage) formDataToSend.append("image", chapterImage);

      const response = await fetch(`${BASE_URL}/api/chapters`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.chapter) {
        toast.success("Chapter created successfully!");
        setChapterForm({ title: "", topicId: "" });
        setChapterImage(null);
        setChapterImagePreview(null);
        setChapters((prev) => [...prev, result.chapter]);
      } else {
        toast.error(result.message || "Failed to create chapter");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmittingChapter(false);
    }
  };

  // ===============================
  // Submit Chapter Details
  // ===============================
  const handleDetailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!detailForm.chapterId.trim() || !detailForm.title.trim()) {
      toast.error("Chapter and title are required");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You must be logged in");
      return;
    }

    setIsSubmittingDetail(true);

    try {
      const formData = new FormData();
      formData.append("chapter_id", detailForm.chapterId);
      formData.append("title", detailForm.title);
      formData.append("serial_id", detailForm.serialId);
      formData.append("description", detailForm.description);
      formData.append("pdf_link", detailForm.pdfLink);
      formData.append("other", detailForm.other);

      if (detailImage) formData.append("image", detailImage);
      if (detailVideo) formData.append("video", detailVideo);

      const res = await fetch(`${BASE_URL}/api/chapter-details`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.detail) {
        toast.success("Chapter details added successfully!");
        setDetailForm({
          chapterId: "",
          title: "",
          serialId: "",
          description: "",
          pdfLink: "",
          other: "",
        });
        setDetailImage(null);
        setDetailVideo(null);
        setDetailImagePreview(null);
        setDetailVideoPreview(null);
      } else {
        toast.error(data.message || "Failed to add details");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmittingDetail(false);
    }
  };

  // ===============================
  // JSX
  // ===============================
  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Add Chapter */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-lg font-semibold">Add New Chapter</h2>
          <form onSubmit={handleChapterSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Chapter Title *</Label>
              <Input
                id="title"
                name="title"
                value={chapterForm.title}
                onChange={handleInputChange}
                placeholder="e.g. Introduction to Driving"
                required
              />
            </div>

            <div className="space-y-2">
              <select
                id="topicId"
                name="topicId"
                value={chapterForm.topicId}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="">-- Select a topics --</option>
                {topics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Chapter Image (optional)</Label>
              <div className="flex items-center gap-4">
                {chapterImagePreview ? (
                  <div className="w-24 h-24 relative rounded overflow-hidden border">
                    <Image
                      src={chapterImagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
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
                  size="sm"
                  onClick={() => chapterFileRef.current?.click()}
                >
                  Choose Image
                </Button>
                <input
                  type="file"
                  ref={chapterFileRef}
                  accept="image/*"
                  onChange={handleChapterImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" disabled={isSubmittingChapter}>
                {isSubmittingChapter ? "Creating..." : "Create Chapter"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Add Chapter Details */}
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-lg font-semibold">Add Chapter Details</h2>
          <form onSubmit={handleDetailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chapterId">Select Chapter *</Label>
              <select
                id="chapterId"
                name="chapterId"
                value={detailForm.chapterId}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                required
              >
                <option value="">-- Select a Chapter --</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={detailForm.title}
                onChange={handleDetailTitleChange}
                placeholder="Introduction Lesson One"
                required
              />
              <p className="text-xs text-muted-foreground">
                Only letters and spaces are allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialId">Serial ID</Label>
              <Input
                id="serialId"
                name="serialId"
                type="number"
                value={detailForm.serialId}
                onChange={handleInputChange}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                name="description"
                value={detailForm.description}
                onChange={handleInputChange}
                className="w-full border rounded p-2 min-h-[100px]"
                placeholder="Welcome to the topic..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdfLink">PDF Link</Label>
              <Input
                id="pdfLink"
                name="pdfLink"
                value={detailForm.pdfLink}
                onChange={handleInputChange}
                placeholder="https://example.com/pdf/intro.pdf"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="other">Other Info</Label>
              <textarea
                id="other"
                name="other"
                value={detailForm.other}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                placeholder="Please watch full video."
              />
            </div>

            {/* Image Upload + Preview */}
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div className="flex items-center gap-4">
                {detailImagePreview ? (
                  <div className="w-24 h-24 relative rounded overflow-hidden border">
                    <Image
                      src={detailImagePreview}
                      alt="Detail Preview"
                      fill
                      className="object-cover"
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
                  size="sm"
                  onClick={() => imageInputRef.current?.click()}
                >
                  Choose Image
                </Button>
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/*"
                  onChange={handleDetailImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Video Upload + Preview */}
            <div className="space-y-2">
              <Label>Upload Video</Label>
              <div className="flex flex-col gap-3">
                {detailVideoPreview && (
                  <video
                    src={detailVideoPreview}
                    controls
                    className="w-full max-h-64 rounded border"
                  />
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
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  onChange={handleDetailVideoChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="submit" disabled={isSubmittingDetail}>
                {isSubmittingDetail ? "Adding..." : "Add Details"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
