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

export type Messages = {
  id: string;
  name: string;
  date: string;
  time: string;
  details: string;
};

export const columns: ColumnDef<Messages>[] = [
  {
    accessorKey: "id",
    header: "Messages Id",
    size: 100,
  },
  {
    accessorKey: "name",
    header: "Name",
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
      const messages = row.original;
      return (
        <div className="flex space-x-2">
          <ViewMessagesModal messages={messages} />
        </div>
      );
    },
  },
];

function ViewMessagesModal({ messages }: { messages: Messages }) {
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
              {messages.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Details:</p>
                <p className="text-sm">{messages.details}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
