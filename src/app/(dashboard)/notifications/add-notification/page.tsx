"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function AddNotification() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Add Notification</h2>

      <Card className="w-full">
        <CardContent className="p-6 space-y-6 lg:pl-16 md:pl-1">
          <div className="w-full max-w-[600px]">
            <Label htmlFor="title" className="block mb-4 text-md font-medium">
              Title
            </Label>
            <Input id="title" />
          </div>

          <div className="w-full max-w-[600px]">
            <Label htmlFor="date" className="block mb-4 text-md font-medium">
              Date
            </Label>
            <Input id="date" />
          </div>

          <div className="w-full max-w-[600px]">
            <Label htmlFor="time" className="block mb-4 text-md font-medium">
              Time
            </Label>
            <Input id="time" />
          </div>

          <div className="w-full max-w-[600px]">
            <Label htmlFor="details" className="block mb-4 text-md font-medium">
              Details
            </Label>
            <Textarea id="details" className="min-h-24"></Textarea>
          </div>

          <Button
            className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white ml-2"
            size="md"
            type="submit"
          >
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
