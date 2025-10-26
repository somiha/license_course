"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

export type Notification = {
  id: string;
  title: string;
  date: string;
  time: string;
  details: string;
};

export const columns: ColumnDef<Notification>[] = [
  {
    accessorKey: "id",
    header: "Notification Id",
    size: 100,
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "details",
    header: "Details",
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const notification = row.original;
      return (
        <div className="flex space-x-2">
          <ViewNotificationModal notification={notification} />
        </div>
      );
    },
  },
];

function ViewNotificationModal({
  notification,
}: {
  notification: Notification;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
        onClick={() => setIsOpen(true)}
      >
        <Eye className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-md text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] p-3 rounded-md mb-4">
              {notification.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Details:</p>
                <p className="text-sm">{notification.details}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
