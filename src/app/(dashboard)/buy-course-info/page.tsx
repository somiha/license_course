"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface BuyCourseInfo {
  id: number;
  buy_course_id: number;
  info: string;
  video_link: string | null;
  pdf_link: string | null;
  created_at: string;
  updated_at: string;
}

export default function BuyCourseInfoPage() {
  const [info, setInfo] = useState<BuyCourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    info: "",
    video_link: "",
    pdf_link: "",
  });

  // Hardcoded buy_course_id — replace with router if dynamic
  const buyCourseId = 1; // ← Change or get from URL

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Missing auth token");

      const response = await fetch(
        `https://course-selling-app.saveneed.com/api/buy-course-info/${buyCourseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();

      // ✅ Expecting: { info: { ... } }
      if (data && data.info) {
        const i = data.info;
        setInfo(i);
        setFormData({
          info: i.info || "",
          video_link: i.video_link || "",
          pdf_link: i.pdf_link || "",
        });
      } else {
        throw new Error("Invalid API response: missing 'info' object");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load course info"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Missing auth token");

      const url = `https://course-selling-app.saveneed.com/api/buy-course-info/${buyCourseId}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const result = await response.json();
      toast.success(result.message || "Course info updated successfully!");
      setEditMode(false);
      fetchInfo(); // Refresh after save
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update course info"
      );
    }
  };

  const renderContent = (html: string) => {
    return html
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Buy Course Info</h2>
        {!editMode && (
          <Button
            className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
            onClick={() => setEditMode(true)}
          >
            Edit Info
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Info */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Welcome Message</h3>
            {editMode ? (
              <Textarea
                name="info"
                value={formData.info}
                onChange={handleInputChange}
                placeholder="Welcome! Start watching the video and download materials..."
                className="min-h-[200px]"
              />
            ) : (
              <div className="prose max-w-none">
                {renderContent(info?.info || "No welcome message set.")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Link */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Video Link</h3>
            {editMode ? (
              <Input
                name="video_link"
                type="url"
                value={formData.video_link}
                onChange={handleInputChange}
                placeholder="https://example.com/course-video.mp4"
              />
            ) : (
              <div>
                {info?.video_link ? (
                  <a
                    href={info.video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    🎥 Watch Video
                  </a>
                ) : (
                  <span className="text-muted-foreground">No video link</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PDF Link */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">PDF Guide</h3>
            {editMode ? (
              <Input
                name="pdf_link"
                type="url"
                value={formData.pdf_link}
                onChange={handleInputChange}
                placeholder="https://example.com/handbook.pdf"
              />
            ) : (
              <div>
                {info?.pdf_link ? (
                  <a
                    href={info.pdf_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    📚 Download PDF
                  </a>
                ) : (
                  <span className="text-muted-foreground">No PDF link</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editMode && (
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
          >
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditMode(false);
              if (info) {
                setFormData({
                  info: info.info,
                  video_link: info.video_link || "",
                  pdf_link: info.pdf_link || "",
                });
              }
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
