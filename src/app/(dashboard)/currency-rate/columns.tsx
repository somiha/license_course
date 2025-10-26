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
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type Currency = {
  id: string;
  name: string;
  value: number;
  country: string;
};

export const columns: ColumnDef<Currency>[] = [
  {
    accessorKey: "id",
    header: "Currency ID",
  },
  {
    accessorKey: "name",
    header: "Currency Name",
  },
  {
    accessorKey: "value",
    header: "Value",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const currency = row.original;
      return (
        <div className="flex space-x-2">
          <EditCurrencyModal currency={currency} />
          <DeleteCurrencyModal currency={currency} />
        </div>
      );
    },
  },
];

function EditCurrencyModal({ currency }: { currency: Currency }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: currency.name,
    value: currency.value,
    country: currency.country,
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const handleSubmit = async () => {
    try {
      const res = await fetch(
        `https://api.t-coin.code-studio4.com/api/tcoin-rates/${currency.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            from_currency: form.name,
            rate: form.value,
            country: form.country,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("Currency updated successfully.");
        location.reload();
      } else {
        alert(data.message || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating currency.");
    }
  };

  return (
    <>
      <Button
        size="icon"
        onClick={() => setIsOpen(true)}
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Pencil className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Currency</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Value</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    value: parseFloat(e.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={form.country}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, country: e.target.value }))
                }
              />
            </div>

            <DialogFooter>
              <Button
                onClick={() => setIsOpen(false)}
                className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
              >
                Save
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DeleteCurrencyModal({ currency }: { currency: Currency }) {
  const [isOpen, setIsOpen] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `https://api.t-coin.code-studio4.com/api/tcoin-rates/${currency.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        alert("Currency deleted.");
        location.reload();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting currency.");
    }
  };

  return (
    <>
      <Button
        size="icon"
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
      >
        <Trash className="w-4 h-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Currency</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this currency?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              onClick={() => setIsOpen(false)}
              className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="text-white bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] hover:opacity-90"
            >
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
