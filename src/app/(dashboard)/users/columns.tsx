// src/app/(dashboard)/users/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Bell, Plus, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

export type User = {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  avatar: string;
};

interface Course {
  id: number;
  name: string;
}

interface CourseApiResponse {
  id: number;
  name: string;
  title?: string;
}

interface EnrollmentApiResponse {
  course_id: number;
}

interface CoursesApiResponse {
  courses?: CourseApiResponse[];
}

interface EnrollmentsApiResponse {
  enrollments?: EnrollmentApiResponse[];
}

function UserActions({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // 📚 Course Enrollment Dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(
    new Set()
  );
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch courses and enrollment status
  useEffect(() => {
    if (!dropdownOpen) return;

    const loadCoursesAndEnrollments = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast.error("Please log in again");
          return;
        }

        // Fetch all courses
        const coursesRes = await fetch(
          "https://course-selling-app.saveneed.com/api/courses?page=1&limit=50"
        );

        if (!coursesRes.ok) {
          throw new Error(`Failed to fetch courses: ${coursesRes.status}`);
        }

        const coursesData: CoursesApiResponse = await coursesRes.json();

        // Process courses
        let fetchedCourses: Course[] = [];

        if (coursesData.courses && Array.isArray(coursesData.courses)) {
          fetchedCourses = coursesData.courses
            .filter(
              (course: CourseApiResponse): course is CourseApiResponse => {
                return (
                  typeof course.id === "number" &&
                  (typeof course.name === "string" ||
                    typeof course.title === "string")
                );
              }
            )
            .map((course: CourseApiResponse) => ({
              id: course.id,
              name: course.name || course.title || "Unnamed Course",
            }));
        }

        setCourses(fetchedCourses);

        // Fetch user's enrollments
        const enrollmentsRes = await fetch(
          `https://course-selling-app.saveneed.com/api/enrollments/user/${userId}?limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!enrollmentsRes.ok) {
          console.warn("Failed to fetch enrollments:", enrollmentsRes.status);
          setEnrolledCourseIds(new Set());
          return;
        }

        const enrollmentsData: EnrollmentsApiResponse =
          await enrollmentsRes.json();

        const ids: number[] =
          enrollmentsData.enrollments &&
          Array.isArray(enrollmentsData.enrollments)
            ? enrollmentsData.enrollments
                .filter(
                  (
                    enrollment: EnrollmentApiResponse
                  ): enrollment is EnrollmentApiResponse => {
                    return typeof enrollment?.course_id === "number";
                  }
                )
                .map(
                  (enrollment: EnrollmentApiResponse) => enrollment.course_id
                )
            : [];

        setEnrolledCourseIds(new Set(ids));
      } catch (error) {
        console.error("Failed to load courses or enrollments:", error);
        toast.error("Could not load course data.");
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCoursesAndEnrollments();
  }, [dropdownOpen, userId]);

  // Toggle enrollment
  const toggleEnrollment = async (courseId: number) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Session expired. Please log in again.");
      return;
    }

    const isEnrolled = enrolledCourseIds.has(courseId);
    setActionLoading(courseId);

    try {
      if (isEnrolled) {
        // Unenroll
        const res = await fetch(
          "https://course-selling-app.saveneed.com/api/enrollments/remove",
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: Number(userId),
              course_id: courseId,
            }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Unenroll failed");
        }

        setEnrolledCourseIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });

        const course = courses.find((course: Course) => course.id === courseId);
        const courseName = course?.name || "Unknown Course";
        toast.success(`Removed from "${courseName}"`);
      } else {
        // Enroll
        const res = await fetch(
          "https://course-selling-app.saveneed.com/api/enrollments",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: Number(userId),
              course_id: courseId,
            }),
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Enroll failed");
        }

        setEnrolledCourseIds((prev) => new Set(prev).add(courseId));
        const course = courses.find((course: Course) => course.id === courseId);
        const courseName = course?.name || "Unknown Course";
        toast.success(`Enrolled in "${courseName}"!`);
      }
    } catch (error) {
      console.error("Toggle enrollment error:", error);
      toast.error(isEnrolled ? "Failed to unenroll" : "Failed to enroll");
    } finally {
      setActionLoading(null);
    }
  };

  // Send notification
  const handleSendNotification = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(
        `https://course-selling-app.saveneed.com/api/notifications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: Number(userId),
            title: "Admin Notification",
            description: message,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Send failed");

      toast.success(data.message || "Notification sent!");
      setIsDialogOpen(false);
      setMessage("");
    } catch (error) {
      console.error("Send notification error:", error);
      toast.error("Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  // Toggle dropdown
  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex items-center gap-2">
      {/* View Profile */}
      <Link href={`/users/${userId}`}>
        <Button
          size="icon"
          variant="ghost"
          className="text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:opacity-90"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </Link>

      {/* Send Notification */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:opacity-90"
          >
            <Bell className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send to {userName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleSendNotification}
              disabled={isSending}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
            >
              {isSending ? "Sending..." : "Send"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 📚 Manage Courses Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDropdownToggle}
          className="text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          {enrolledCourseIds.size > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {enrolledCourseIds.size}
            </span>
          )}
        </Button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50 max-h-96 flex flex-col">
            <div className="p-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h4 className="font-semibold text-sm text-gray-800">
                Manage Courses for {userName}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {enrolledCourseIds.size} enrolled • {courses.length} total
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingCourses ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                  <p className="text-sm text-gray-500">Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No courses available</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Check if the courses API is working
                  </p>
                </div>
              ) : (
                courses.map((course: Course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors group"
                  >
                    <button
                      onClick={() => toggleEnrollment(course.id)}
                      disabled={actionLoading !== null}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                        enrolledCourseIds.has(course.id)
                          ? "bg-green-100 border-green-500"
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      } ${
                        actionLoading === course.id
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      title={
                        enrolledCourseIds.has(course.id)
                          ? "Click to unenroll"
                          : "Click to enroll"
                      }
                    >
                      {actionLoading === course.id ? (
                        <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                      ) : enrolledCourseIds.has(course.id) ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : null}
                    </button>
                    <span className="text-sm font-medium truncate flex-1 text-left">
                      {course.name}
                    </span>
                    {enrolledCourseIds.has(course.id) && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full shrink-0 font-medium">
                        Enrolled
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-gray-600">
                {courses.length} courses available
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDropdownOpen(false)}
                className="text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: "User ID",
  },
  {
    id: "avatar",
    header: () => null,
    cell: ({ row }) => (
      <div className="w-10 h-10 relative rounded-full overflow-hidden">
        <Image
          src={row.original.avatar}
          alt={row.original.name}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "mobile_number",
    header: "Mobile Number",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    id: "action",
    header: "Actions",
    cell: ({ row }) => (
      <UserActions userId={row.original.id} userName={row.original.name} />
    ),
  },
];
