"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Trash2,
  ArrowUpDown,
  Loader2,
  MoreVertical,
  ToggleLeft,
  ToggleRight,
  Power,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";

export type Agent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "agent";
  status: "active" | "hold" | "blocked";
  isApproved: boolean;
  canReceiveRemittanceList?: boolean;
  image?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  state?: string | null;
  zip_code?: string | null;
  nid_card_number?: string | null;
  nid_card_front_pic_url?: string | null;
  nid_card_back_pic_url?: string | null;
  passport_file_url?: string | null;
  qr_code?: string | null;
  createdAt?: string;
  updatedAt?: string;
  tcoin_balance?: string;
  local_currency_balance?: string;
  accepted_terms?: boolean;
  birth_date?: string | null;
  institution_name?: string | null;
};

function AgentActions({
  agent,
  onActionComplete,
}: {
  agent: Agent;
  onActionComplete: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<
    "delete" | "toggle" | "status"
  >();
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [newStatus, setNewStatus] = useState<"active" | "hold" | "blocked">(
    agent.status
  );

  const handleAction = async (type: "delete" | "toggle" | "status") => {
    setActionType(type);
    setIsLoading(true);

    const token = localStorage.getItem("authToken");

    if (!token) {
      toast.error("Authorization error. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      let endpoint = "";
      let method = "GET";
      let body = null;

      if (type === "delete") {
        endpoint = `https://api.t-coin.code-studio4.com/api/agents/${agent.id}`;
        method = "DELETE";
      } else if (type === "toggle") {
        endpoint = `https://api.t-coin.code-studio4.com/api/agents/${agent.id}`;
        method = "PUT";
        body = JSON.stringify({
          canReceiveRemittanceList: !agent.canReceiveRemittanceList,
        });
      } else if (type === "status") {
        endpoint = `https://api.t-coin.code-studio4.com/api/users/bulk-update/multiple`;
        method = "PUT";
        body = JSON.stringify({
          userIds: [agent.id], // or multiple IDs if needed
          userType: "agent",
          updateData: {
            status: newStatus,
          },
          note: statusNote || `Agent status updated to ${newStatus}`,
        });
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success(
        type === "delete"
          ? "Agent deleted successfully"
          : type === "toggle"
          ? `Remittance ${
              !agent.canReceiveRemittanceList ? "enabled" : "disabled"
            } successfully`
          : `Status updated to ${newStatus}`
      );
      onActionComplete();
      if (type === "status") setShowStatusDialog(false);
      if (type === "delete") setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Action error:", error);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusNoteChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setStatusNote(e.target.value);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* View Details Button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Agent Details</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {agent.image && (
                  <div className="relative h-24 w-24 min-w-[6rem]">
                    <Image
                      src={agent.image}
                      alt="Agent image"
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                  <p className="text-sm text-muted-foreground">{agent.phone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Basic Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <InfoRow label="ID" value={agent.id} />
                  <InfoRow label="Type" value={agent.type} />
                  {agent.birth_date && (
                    <InfoRow
                      label="Birth Date"
                      value={new Date(agent.birth_date).toLocaleDateString()}
                    />
                  )}
                  {agent.institution_name && (
                    <InfoRow
                      label="Institution"
                      value={agent.institution_name}
                    />
                  )}
                  <InfoRow label="Country" value={agent.country} />
                  <InfoRow label="City" value={agent.city} />
                  <InfoRow label="Address" value={agent.address} />
                  <InfoRow label="NID Number" value={agent.nid_card_number} />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Balances</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <InfoRow
                    label="T-Coin Balance"
                    value={agent.tcoin_balance || "0.00"}
                  />
                  <InfoRow
                    label="Local Currency"
                    value={agent.local_currency_balance || "0.00"}
                  />
                </div>
              </div>

              {agent.createdAt && (
                <div className="space-y-2">
                  <h4 className="font-medium">Dates</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <InfoRow
                      label="Created At"
                      value={new Date(agent.createdAt).toLocaleString()}
                    />
                    {agent.updatedAt && (
                      <InfoRow
                        label="Updated At"
                        value={new Date(agent.updatedAt).toLocaleString()}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {agent.qr_code && (
                <ImageBlock title="QR Code" src={agent.qr_code} />
              )}
              {agent.nid_card_front_pic_url && (
                <ImageBlock
                  title="NID Front"
                  src={agent.nid_card_front_pic_url}
                />
              )}
              {agent.nid_card_back_pic_url && (
                <ImageBlock
                  title="NID Back"
                  src={agent.nid_card_back_pic_url}
                />
              )}
              {agent.passport_file_url && (
                <ImageBlock title="Passport" src={agent.passport_file_url} />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Three Dots Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            title="More actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {/* Status Update Option */}
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setNewStatus(agent.status);
              setShowStatusDialog(true);
            }}
            disabled={isLoading && actionType === "status"}
          >
            {isLoading && actionType === "status" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Power className="mr-2 h-4 w-4" />
            )}
            Update Status
          </DropdownMenuItem>

          {/* Delete Action */}
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Agent
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p>
                Are you sure you want to delete <strong>{agent.name}</strong>?
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction("delete")}
                  disabled={isLoading && actionType === "delete"}
                >
                  {isLoading && actionType === "delete" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Toggle Remittance */}
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleAction("toggle");
            }}
            disabled={isLoading && actionType === "toggle"}
          >
            {isLoading && actionType === "toggle" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : agent.canReceiveRemittanceList ? (
              <ToggleLeft className="mr-2 h-4 w-4" />
            ) : (
              <ToggleRight className="mr-2 h-4 w-4" />
            )}
            {agent.canReceiveRemittanceList
              ? "Disable Remittance"
              : "Enable Remittance"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge
                className={
                  newStatus === "active"
                    ? "bg-green-500 text-white"
                    : newStatus === "hold"
                    ? "bg-yellow-500 text-white"
                    : "bg-red-500 text-white"
                }
              >
                {newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Update {agent.name} status
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Status Selection */}
            <select
              value={newStatus}
              onChange={(e) =>
                setNewStatus(e.target.value as "active" | "hold" | "blocked")
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="active">Active</option>
              <option value="hold">Hold</option>
              <option value="blocked">Blocked</option>
            </select>

            {/* Optional Note */}
            <Textarea
              placeholder="Add a note (optional)"
              value={statusNote}
              onChange={handleStatusNoteChange}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAction("status")}
              disabled={isLoading && actionType === "status"}
            >
              {isLoading && actionType === "status" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Confirm Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper components
function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p>{value || "-"}</p>
    </div>
  );
}

function ImageBlock({ title, src }: { title: string; src: string }) {
  return (
    <div className="space-y-2">
      <h4 className="font-medium">{title}</h4>
      <div className="relative w-full h-40">
        <Image
          src={src}
          alt={title}
          fill
          className="rounded-md object-contain"
        />
      </div>
    </div>
  );
}

export const columns = (refreshData: () => void): ColumnDef<Agent>[] => [
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
    header: "ID",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      console.log("Row data:", row.original);

      const status = row.original.status?.toLowerCase();
      return (
        <Badge
          className={
            status === "active"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : status === "hold"
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : status === "blocked"
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-500 hover:bg-gray-600 text-white"
          }
        >
          {status
            ? status.charAt(0).toUpperCase() + status.slice(1)
            : "Unknown"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isApproved",
    header: "Approval",
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className={`${
          row.original.isApproved
            ? "bg-green-100 text-green-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {row.original.isApproved ? "Approved" : "Pending"}
      </Badge>
    ),
  },
  {
    accessorKey: "canReceiveRemittance",
    header: "Can Receive Remittance",
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className={`${
          row.original.canReceiveRemittanceList
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {row.original.canReceiveRemittanceList ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "tcoin_balance",
    header: "TCoin Balance",
    cell: ({ row }) => <span>{row.original.tcoin_balance || "0.00"}</span>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <AgentActions agent={row.original} onActionComplete={refreshData} />
    ),
  },
];
