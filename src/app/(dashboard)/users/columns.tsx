"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Bell } from "lucide-react";
import Image from "next/image";
// import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export type User = {
  id: string;
  name: string;
  email: string;
  mobile_number: string;
  avatar: string;
};

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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: Number(userId), // ✅ correct key name
            title: "Admin Notification", // ✅ backend expects a title
            description: message, // ✅ backend expects description, not "message"
          }),
        }
      );

      const data = await response.json();
      console.log("Notification response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to send notification");
      }

      toast.success(data.message || "Notification sent successfully");
      setIsDialogOpen(false);
      setMessage("");
    } catch (error) {
      toast.error("Failed to send notification");
      console.error("Notification error:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link href={`/users/${userId}`}>
        <Button
          size="icon"
          variant="ghost"
          className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </Link>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
          >
            <Bell className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification to {userName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <Textarea
              placeholder="Enter your notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              onClick={handleSendNotification}
              disabled={isSending}
              className="w-full"
            >
              {isSending ? "Sending..." : "Send Notification"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const columns: ColumnDef<User>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "id",
    header: "User Id",
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
    header: "Action",
    cell: ({ row }) => (
      <UserActions userId={row.original.id} userName={row.original.name} />
    ),
  },
];
