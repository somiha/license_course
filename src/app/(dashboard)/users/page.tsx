"use client";

import { columns, User } from "./columns";
import { DataTable } from "../data-table";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Megaphone, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface UserApiResponse {
  id: number;
  full_name: string | null;
  email: string | null;
  mobile_number: string;
  image: string | null;
  status?: "active" | "hold" | "blocked"; // optional since not in your sample
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("Unauthorized: Please log in again");
        return;
      }

      const response = await fetch(
        "https://course-selling-app.saveneed.com/api/auth/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch users");

      const data: { users: UserApiResponse[] } = await response.json();

      if (!Array.isArray(data.users)) {
        throw new Error("Invalid response format");
      }

      const formatted = data.users.map((user) => ({
        id: String(user.id),
        name: user.full_name || "N/A",
        email: user.email || "N/A",
        mobile_number: user.mobile_number || "N/A",
        avatar: user.image || "/default-avatar.png",
        status: user.status || "active", // safe fallback
      }));

      setUsers(formatted);
      setFilteredUsers(formatted);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Safe search: only search relevant string fields
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      setFilteredUsers(users);
      return;
    }

    const result = users.filter((user) =>
      [user.name, user.email, user.mobile_number, user.id].some((field) =>
        field?.toString().toLowerCase().includes(q)
      )
    );
    setFilteredUsers(result);
  }, [searchQuery, users]);

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSendingBroadcast(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Missing auth token");

      const response = await fetch(
        "https://api.t-coin.code-studio4.com/api/notifications/broadcast",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: broadcastMessage }),
        }
      );

      if (!response.ok) throw new Error("Broadcast failed");

      toast.success("Broadcast sent successfully!");
      setBroadcastMessage("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Broadcast error:", error);
      toast.error("Failed to send broadcast");
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">All Users</h1>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90">
                    <Megaphone className="h-4 w-4" />
                    Broadcast Notification
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Broadcast Notification</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Textarea
                      placeholder="Enter your broadcast message"
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                    />
                    <Button
                      onClick={handleBroadcast}
                      disabled={isSendingBroadcast}
                      className="w-full"
                    >
                      {isSendingBroadcast ? "Sending..." : "Send Broadcast"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* 🔍 Search */}
            <div className="mb-4 relative">
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm pl-10"
              />
              <Search className="absolute p-1 h-6 w-6 text-gray-400 left-2 top-2" />
            </div>

            {loading ? (
              <p className="text-center py-8">Loading users...</p>
            ) : (
              <DataTable columns={columns} data={filteredUsers} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
