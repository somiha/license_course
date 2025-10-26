import { columns } from "./columns";
import { DataTable } from "../data-table";
import type { Notification } from "./columns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const notification: Notification[] = [
  {
    id: "1",
    title: "Notification 1",
    date: "2023-01-01",
    time: "10:00 AM",
    details: "Details for Notification 1",
  },
  {
    id: "2",
    title: "Notification 2",
    date: "2023-01-02",
    time: "11:00 AM",
    details:
      "Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 Details for Notification 2 ",
  },
];

export default function Notification() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Main Content */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">
                Notifications
              </h1>
              <Link href="/notifications/add-notification">
                <Button className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90">
                  + Add Notification
                </Button>
              </Link>
            </div>
            <DataTable columns={columns} data={notification} />
          </div>
        </main>
      </div>
    </div>
  );
}
