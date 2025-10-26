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
import { useState, useRef } from "react";
import Image from "next/image";

export type Course = {
  id: string;
  name: string;
  image: string;
  description?: string;
  price: string;
  discountedPrice: string;
  duration: string;
  time: string;
  videoLecture: number; // e.g., 16
  pdfLecture: number; // e.g., 8
  liveClass: number; // e.g., 10
  learnFromCourse?: string;
  courseCertificate?: string;
  category: string;
  categoryId: number;
  instructor: string;
  instructorId: number | null;
};

const BASE_URL = "http://localhost:5002";

export const courseColumns: ColumnDef<Course>[] = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "instructor", header: "Instructor" },
  { accessorKey: "price", header: "Price ($)" },
  { accessorKey: "discountedPrice", header: "Discounted ($)" },
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.original.image;
      if (!imageUrl)
        return <span className="text-muted-foreground">No image</span>;
      return (
        <div className="w-16 h-16 relative rounded overflow-hidden border">
          <Image
            src={imageUrl}
            alt={row.original.name}
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
      const course = row.original;
      return (
        <div className="flex gap-2">
          <ViewCourseDetails course={course} />
          <EditCourseModal course={course} />
          <DeleteCourseModal course={course} />
        </div>
      );
    },
  },
];

// =============== VIEW MODAL ===============
function ViewCourseDetails({ course }: { course: Course }) {
  const [isOpen, setIsOpen] = useState(false);

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
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{course.name}</DialogTitle>
            <DialogDescription>Course details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-32 h-32 relative rounded overflow-hidden border">
                <Image
                  src={course.image}
                  alt={course.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1">
                <p>
                  <strong>Category:</strong> {course.category}
                </p>
                <p>
                  <strong>Instructor:</strong> {course.instructor}
                </p>
                <p>
                  <strong>Duration:</strong> {course.duration}
                </p>
                <p>
                  <strong>Schedule:</strong> {course.time}
                </p>
                <p>
                  <strong>Price:</strong> ${course.price}
                </p>
                <p>
                  <strong>Discounted:</strong> ${course.discountedPrice}
                </p>
                <p>
                  <strong>Video Lectures:</strong> {course.videoLecture}
                </p>
                <p>
                  <strong>PDF Lectures:</strong> {course.pdfLecture}
                </p>
                <p>
                  <strong>Live Classes:</strong> {course.liveClass}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">
                {course.description || "No description available."}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">What You will Learn</h4>
              <p className="text-sm text-muted-foreground">
                {course.learnFromCourse || "—"}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Certificate</h4>
              <p className="text-sm text-muted-foreground">
                {course.courseCertificate || "—"}
              </p>
            </div>
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
function EditCourseModal({ course }: { course: Course }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: course.name,
    description: course.description || "",
    price: course.price,
    discountedPrice: course.discountedPrice,
    courseDuration: course.duration,
    time: course.time,
    videoLecture: String(course.videoLecture),
    pdfLecture: String(course.pdfLecture),
    liveClass: String(course.liveClass),
    learnFromCourse: course.learnFromCourse || "",
    courseCertificate: course.courseCertificate || "",
    categoryId: course.categoryId.toString(),
    instructorId: course.instructorId?.toString() || "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
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

      const response = await fetch(`${BASE_URL}/api/courses/${course.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update course");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
      setIsOpen(false);
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Name</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded text-sm"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price ($)</Label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Discounted Price ($)</Label>
                <Input
                  name="discountedPrice"
                  type="number"
                  step="0.01"
                  value={formData.discountedPrice}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Course Duration</Label>
              <Input
                name="courseDuration"
                value={formData.courseDuration}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Time</Label>
              <Input
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            {/* ✅ Updated: Number inputs for lecture counts */}
            <div className="space-y-2">
              <Label>Lecture Counts</Label>
              <div className="grid grid-cols-3 gap-3">
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

            <div>
              <Label>What You will Learn</Label>
              <textarea
                name="learnFromCourse"
                value={formData.learnFromCourse}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded text-sm"
                rows={2}
              />
            </div>

            <div>
              <Label>Certificate Info</Label>
              <Input
                name="courseCertificate"
                value={formData.courseCertificate}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category ID</Label>
                <Input
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Instructor ID</Label>
                <Input
                  name="instructorId"
                  value={formData.instructorId}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Image (optional)</Label>
              <Input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =============== DELETE MODAL ===============
function DeleteCourseModal({ course }: { course: Course }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/courses/${course.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        window.location.reload();
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
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{course.name}</strong>?
              This action cannot be undone.
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
