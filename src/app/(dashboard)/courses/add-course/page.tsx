"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BASE_URL = "https://course-selling-app.saveneed.com";

export default function AddCoursePage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountedPrice: "",
    courseDuration: "",
    time: "",
    videoLecture: "0", // ← stringified number
    pdfLecture: "0",
    liveClass: "0",
    learnFromCourse: "",
    courseCertificate: "",
    categoryId: "",
    instructorId: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in");
      return;
    }

    if (!formData.name.trim() || !formData.categoryId.trim()) {
      alert("Please fill in required fields: Name and Category ID");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      if (formData.description)
        formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("discounted_price", formData.discountedPrice);
      if (formData.courseDuration)
        formDataToSend.append("course_duration", formData.courseDuration);
      if (formData.time) formDataToSend.append("time", formData.time);
      formDataToSend.append("video_lecture", formData.videoLecture);
      formDataToSend.append("pdf_lecture", formData.pdfLecture);
      formDataToSend.append("live_class", formData.liveClass);
      if (formData.learnFromCourse)
        formDataToSend.append("learn_from_course", formData.learnFromCourse);
      if (formData.courseCertificate)
        formDataToSend.append("course_certificate", formData.courseCertificate);
      formDataToSend.append("category_id", formData.categoryId);
      if (formData.instructorId)
        formDataToSend.append("instructor_id", formData.instructorId);

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        formDataToSend.append("image", file);
      }

      const response = await fetch(`${BASE_URL}/api/courses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.course) {
        alert("Course created successfully!");
        router.push("/courses");
      } else {
        const errorMsg =
          result.error || result.message || "Failed to create course";
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
      <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
      <Card className="w-full max-w-3xl">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Advanced Driving Masterclass"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief course description..."
                rows={3}
              />
            </div>

            {/* Price & Discounted Price */}
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="discountedPrice">Discounted Price ($)</Label>
              <Input
                id="discountedPrice"
                name="discountedPrice"
                type="number"
                step="0.01"
                value={formData.discountedPrice}
                onChange={handleChange}
              />
            </div>

            {/* Duration & Time */}
            <div>
              <Label htmlFor="courseDuration">Course Duration</Label>
              <Input
                id="courseDuration"
                name="courseDuration"
                value={formData.courseDuration}
                onChange={handleChange}
                placeholder="e.g. 8 weeks"
              />
            </div>
            <div>
              <Label htmlFor="time">Schedule / Time</Label>
              <Input
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="e.g. Weekends 9AM–11AM"
              />
            </div>

            {/* Category & Instructor ID */}
            <div>
              <Label htmlFor="categoryId">Category ID *</Label>
              <Input
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <Label htmlFor="instructorId">Instructor ID (optional)</Label>
              <Input
                id="instructorId"
                name="instructorId"
                value={formData.instructorId}
                onChange={handleChange}
                placeholder="e.g. 5"
              />
            </div>

            {/* ✅ REPLACED: Lecture Counts as Number Inputs */}
            <div className="md:col-span-2">
              <Label>Lecture Counts</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div>
                  <Label className="text-xs">Video Lectures</Label>
                  <Input
                    name="videoLecture"
                    type="number"
                    min="0"
                    value={formData.videoLecture}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">PDF Lectures</Label>
                  <Input
                    name="pdfLecture"
                    type="number"
                    min="0"
                    value={formData.pdfLecture}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Live Classes</Label>
                  <Input
                    name="liveClass"
                    type="number"
                    min="0"
                    value={formData.liveClass}
                    onChange={handleChange}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="md:col-span-2">
              <Label>What You will Learn</Label>
              <Textarea
                name="learnFromCourse"
                value={formData.learnFromCourse}
                onChange={handleChange}
                placeholder="e.g. Master defensive driving, night driving..."
                rows={2}
              />
            </div>

            {/* Certificate Info */}
            <div className="md:col-span-2">
              <Label>Certificate Information</Label>
              <Input
                name="courseCertificate"
                value={formData.courseCertificate}
                onChange={handleChange}
                placeholder="e.g. Yes, certified by DMV"
              />
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <Label>Course Image</Label>
              <div className="mt-2 flex items-center gap-4">
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
                  onClick={() => fileInputRef.current?.click()}
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
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white"
            >
              {isSubmitting ? "Creating..." : "Create Course"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
