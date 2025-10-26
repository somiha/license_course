"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";

export type Video = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
};

export const columns: ColumnDef<Video>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    id: "video",
    header: "Video",
    cell: ({ row }) => (
      <div className="relative w-[200px] h-[100px] bg-gray-100">
        <video
          width="200"
          height="100"
          controls
          playsInline
          className="object-cover w-full h-full"
          crossOrigin="anonymous"
        >
          <source src={row.original.videoUrl} type="video/mp4" />
          Your browser doesnot support HTML5 video.
        </video>
      </div>
    ),
  },
  {
    id: "thumbnail",
    header: "Thumbnail",
    cell: ({ row }) => (
      <Image
        src={row.original.thumbnail}
        alt="Thumbnail"
        width={80}
        height={45}
        className="rounded"
      />
    ),
  },

  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description || "";
      const maxLength = 50;

      return (
        <details className="group max-w-[250px]">
          <summary className="flex items-center gap-2 cursor-pointer list-none">
            <span className="truncate group-open:hidden">
              {description.length > maxLength
                ? `${description.substring(0, maxLength)}...`
                : description}
            </span>
            <span className="hidden group-open:block whitespace-pre-wrap">
              {description}
            </span>
            {description.length > maxLength && (
              <Button asChild size="icon" variant={"ghost"}>
                <span className="group-open:hidden">See More</span>
              </Button>
            )}
          </summary>
        </details>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const video = row.original;
      return (
        <div className="flex gap-2">
          <EditVideoModal video={video} />
          <DeleteVideoModal video={video} />
        </div>
      );
    },
  },
];

function EditVideoModal({ video }: { video: Video }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (videoFile) formData.append("video", videoFile);
    if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

    const res = await fetch(
      `https://api.t-coin.code-studio4.com/api/video-tutorial/${video.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const result = await res.json();
    if (result.success) {
      location.reload();
    } else {
      alert(result.message || "Update failed");
    }
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Button
        size="icon"
        onClick={() => setOpen(true)}
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Pencil className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Video File</Label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label>Thumbnail</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DeleteVideoModal({ video }: { video: Video }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const res = await fetch(
      `https://api.t-coin.code-studio4.com/api/video-tutorial/${video.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await res.json();
    if (result.success) {
      location.reload();
    } else {
      alert(result.message || "Delete failed");
    }
    setLoading(false);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Trash className="w-4 h-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
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
