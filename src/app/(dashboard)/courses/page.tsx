// src/app/(dashboard)/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { courseColumns, Course } from "./columns";
import { DataTable } from "../data-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Match your API response shape
interface CourseFromAPI {
  id: number;
  name: string;
  image: string;
  description: string;
  price: string;
  discounted_price: string;
  course_duration: string;
  time: string;
  video_lecture: number; // 1 or 0
  pdf_lecture: number;
  live_class: number;
  learn_from_course: string;
  course_certificate: string;
  category_name: string;
  category_id: number;
  instructor_name: string | null;
  instructor_id: number | null;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("Missing authToken");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "https://course-selling-app.saveneed.com/api/courses?page=1&limit=10",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch courses");

        const data = await response.json();

        if (Array.isArray(data.courses)) {
          const formatted: Course[] = data.courses.map(
            (course: CourseFromAPI) => ({
              id: String(course.id),
              name: course.name,
              image: course.image,
              description: course.description,
              price: course.price,
              discountedPrice: course.discounted_price,
              duration: course.course_duration,
              time: course.time,
              videoLecture: course.video_lecture,
              pdfLecture: course.pdf_lecture,
              liveClass: course.live_class,
              learnFromCourse: course.learn_from_course,
              courseCertificate: course.course_certificate,
              category: course.category_name || "Uncategorized",
              categoryId: course.category_id,
              instructor: course.instructor_name || "—",
              instructorId: course.instructor_id,
            })
          );
          setCourses(formatted);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
              <Link href="/courses/add-course">
                <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                  + Add Course
                </Button>
              </Link>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <DataTable columns={courseColumns} data={courses} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
