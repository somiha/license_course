// src/app/(dashboard)/topics/add/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Image from "next/image";

const BASE_URL = "https://course-selling-app.saveneed.com";

export default function AddTopicPage() {
  // ===============================
  // Combined Form State
  // ===============================
  const [form, setForm] = useState({
    courseId: "",
    title: "",
    serialId: "",
    description: "",
    pdfLink: "",
    other: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);

  // ===============================
  // Fetch Courses
  // ===============================
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/courses`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          toast.error("Failed to load courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Network error: Could not load courses");
      }
    };
    fetchCourses();
  }, []);

  // ===============================
  // Handlers
  // ===============================
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // ===============================
  // Submit Topic Detail
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { courseId, title, serialId, description } = form;

    if (!courseId || !title.trim() || !serialId || !description.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not logged in");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("course_id", courseId);
      formData.append("title", title);
      formData.append("serial_id", serialId);
      formData.append("description", description);
      formData.append("pdf_link", form.pdfLink?.trim() || "");
      formData.append("other", form.other?.trim() || "");

      if (image) formData.append("image", image);

      const res = await fetch(`${BASE_URL}/api/topics`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.detail) {
        alert("Topic created successfully!");
        // Reset form
        setForm({
          courseId: "",
          title: "",
          serialId: "",
          description: "",
          pdfLink: "",
          other: "",
        });
        setImage(null);
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
      } else {
        toast.error(result.message || "Failed to add topic");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===============================
  // Render
  // ===============================
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Add New Topic</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Selection */}
            <div className="space-y-2">
              <Label htmlFor="courseId">Course *</Label>
              <select
                id="courseId"
                name="courseId"
                value={form.courseId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                placeholder="e.g. Introduction to Driving"
                required
              />
            </div>

            {/* Serial ID */}
            <div className="space-y-2">
              <Label htmlFor="serialId">Serial ID *</Label>
              <Input
                id="serialId"
                name="serialId"
                type="number"
                value={form.serialId}
                onChange={handleInputChange}
                placeholder="1"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="This lesson covers basic rules of the road..."
                required
              />
            </div>

            {/* PDF Link */}
            <div className="space-y-2">
              <Label htmlFor="pdfLink">PDF Link</Label>
              <Input
                id="pdfLink"
                name="pdfLink"
                value={form.pdfLink}
                onChange={handleInputChange}
                placeholder="https://example.com/doc.pdf"
              />
            </div>

            {/* Other Notes */}
            <div className="space-y-2">
              <Label htmlFor="other">Other Notes</Label>
              <Input
                id="other"
                name="other"
                value={form.other}
                onChange={handleInputChange}
                placeholder="Please watch full video before proceeding"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Upload Image (Optional)</Label>
              {imagePreview ? (
                <div className="relative w-48 h-32 rounded overflow-hidden border group">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    Choose Image
                  </Button>
                  <span className="text-sm text-gray-500">
                    No image selected
                  </span>
                </div>
              )}
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Topic"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
