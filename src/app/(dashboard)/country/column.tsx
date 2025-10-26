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
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export type Country = {
  id: string;
  name: string;
  code: string;
  active: boolean;
};

export const countryColumns: ColumnDef<Country>[] = [
  {
    accessorKey: "id",
    header: "Country ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => (row.original.active ? "Yes" : "No"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const country = row.original;
      return (
        <div className="flex gap-2">
          <EditCountryModal country={country} />
          <DeleteCountryModal country={country} />
        </div>
      );
    },
  },
];

function EditCountryModal({ country }: { country: Country }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: country.name,
    code: country.code,
    active: country.active,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () =>
    setFormData((prev) => ({ ...prev, active: !prev.active }));

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.t-coin.code-studio4.com/api/country/${country.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (result.success) window.location.reload();
    } catch (error) {
      console.error("Error updating country", error);
    }
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Country</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Country Name"
            />
            <Input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Country Code"
            />

            <div className="flex items-center gap-2">
              <span className="text-sm">Active:</span>
              <Switch
                checked={formData.active}
                onCheckedChange={handleToggle}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
                onClick={handleSave}
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

function DeleteCountryModal({ country }: { country: Country }) {
  const [isOpen, setIsOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.t-coin.code-studio4.com/api/country/${country.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) window.location.reload();
    } catch (error) {
      console.error("Error deleting country", error);
    }
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        size="icon"
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Trash className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Country</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {country.name}?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
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
