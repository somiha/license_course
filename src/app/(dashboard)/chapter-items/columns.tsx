"use client";

import { useState, useRef, useEffect } from "react";
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
import Image from "next/image";

const BASE_URL = "https://course-selling-app.saveneed.com";

// ================= Types =================
export interface ItemAudio {
  id: number;
  audio: string;
  language: string;
  chapter_details_id: number;
}

export interface ItemContent {
  id: number;
  chapter_details_id: number;
  content: string | null;
  image: string | null;
  video: string | null;
  audios: ItemAudio[];
}

export type ContentItem = ItemContent;

// ================= View Modal =================
interface ViewDetailModalProps {
  detail: ItemContent;
}

export function ViewDetailModal({ detail }: ViewDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [audios, setAudios] = useState<ItemAudio[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAudios = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token");

        const res = await fetch(
          `${BASE_URL}/api/item-audios?page=1&limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch audios");

        const data = await res.json();
        const allAudios: ItemAudio[] = data.audios || [];

        const mappedAudios = allAudios.filter(
          (a) => a.chapter_details_id === detail.chapter_details_id
        );

        setAudios(mappedAudios);
      } catch (err) {
        console.error(err);
        setAudios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudios();
  }, [isOpen, detail.chapter_details_id]);

  return (
    <>
      <Button
        className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Eye className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Content #{detail.id}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {detail.content && (
              <p className="text-sm whitespace-pre-wrap">{detail.content}</p>
            )}

            {detail.image && (
              <div className="w-full h-48 relative rounded overflow-hidden border">
                <Image
                  src={detail.image}
                  alt={`Content ${detail.id}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            {detail.video && (
              <video controls className="w-full rounded">
                <source src={detail.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            {loading ? (
              <p>Loading audios...</p>
            ) : audios.length > 0 ? (
              <div className="space-y-2">
                <h5 className="font-medium text-sm">Audios:</h5>
                {audios.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <span>🎧 {a.language}:</span>
                    <audio controls className="h-8 flex-1">
                      <source src={a.audio} type="audio/mpeg" />
                      Not supported.
                    </audio>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No audios.</p>
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

// ================= Edit Modal =================
function EditDetailModal({ detail }: { detail: ItemContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ content: detail.content || "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [audios, setAudios] = useState<ItemAudio[]>([]);
  const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
  const [newAudioLang, setNewAudioLang] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchAudios = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const res = await fetch(
          `${BASE_URL}/api/item-audios?page=1&limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        const allAudios: ItemAudio[] = data.audios || [];
        const mapped = allAudios.filter(
          (a) => a.chapter_details_id === detail.chapter_details_id
        );
        setAudios(mapped);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAudios();
  }, [isOpen, detail.chapter_details_id]);

  const handleDeleteAudio = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch(`${BASE_URL}/api/item-audios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAudios((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const form = new FormData();
      form.append("content", formData.content);

      const file = fileInputRef.current?.files?.[0];
      if (file) form.append("image", file);

      if (newAudioFile && newAudioLang) {
        form.append("audio", newAudioFile);
        form.append("language", newAudioLang);
      }

      const res = await fetch(`${BASE_URL}/api/item-contents/${detail.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Content #{detail.id}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Label>Content</Label>
            <textarea
              name="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full p-2 border rounded"
              rows={4}
            />

            <Label>Image (optional)</Label>
            <Input type="file" ref={fileInputRef} accept="image/*" />

            <Label className="mt-2">Existing Audios</Label>
            <div className="space-y-2">
              {audios.length > 0 ? (
                audios.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <span>{a.language}</span>
                    <audio controls src={a.audio} className="flex-1 h-8" />
                    <Button
                      className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteAudio(a.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No audios</p>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <Label>Add New Audio</Label>
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) =>
                  setNewAudioFile(e.target.files ? e.target.files[0] : null)
                }
              />
              <Input
                placeholder="Language"
                value={newAudioLang}
                onChange={(e) => setNewAudioLang(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ================= Delete Modal =================
function DeleteDetailModal({ detail }: { detail: ItemContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/item-contents/${detail.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
        size="icon"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      >
        <Trash className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content #{detail.id}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
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

// ================= Table Columns =================
export const detailColumns: ColumnDef<ContentItem>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "content",
    header: "Content Preview",
    cell: ({ row }) => (
      <div className="text-sm whitespace-pre-wrap">
        {row.original.content
          ? `${row.original.content.slice(0, 50)}...`
          : "No content"}
      </div>
    ),
  },
  {
    id: "image",
    header: "Image",
    cell: ({ row }) =>
      row.original.image ? (
        <div className="w-16 h-16 relative rounded overflow-hidden border">
          <Image
            src={row.original.image}
            alt={`Content ${row.original.id}`}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <span className="text-muted-foreground">No image</span>
      ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <ViewDetailModal detail={row.original} />
        <EditDetailModal detail={row.original} />
        <DeleteDetailModal detail={row.original} />
      </div>
    ),
  },
];
