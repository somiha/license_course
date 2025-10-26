"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserProfile {
  id: number;
  full_name: string;
  email: string | null;
  mobile_number: string;
  image: string | null;
  type: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    id: 0,
    full_name: "",
    email: "",
    mobile_number: "",
    image: null,
    type: "",
  });

  const imageInputRef = useRef<HTMLInputElement>(null);

  // ✅ Fixed: Define fetchProfile inside useEffect or as async function
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No auth token");
        }

        const res = await fetch(
          "https://course-selling-app.saveneed.com/api/auth/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          console.error("Profile API error:", text);
          throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        const user = data.user;

        setProfile({
          id: user.id,
          full_name: user.full_name || "",
          email: user.email || "",
          mobile_number: user.mobile_number || "",
          image: user.image,
          type: user.type,
        });
      } catch (err) {
        console.error("Fetch profile failed:", err);
        toast.error("Failed to load profile");
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, image: url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Not authenticated");
      setUpdating(false);
      return;
    }

    if (!profile.full_name.trim()) {
      toast.error("Full name is required");
      setUpdating(false);
      return;
    }
    if (!profile.mobile_number.trim()) {
      toast.error("Mobile number is required");
      setUpdating(false);
      return;
    }

    const formData = new FormData();
    formData.append("full_name", profile.full_name);
    formData.append("mobile_number", profile.mobile_number);
    if (profile.email) {
      formData.append("email", profile.email);
    }
    if (imageInputRef.current?.files?.[0]) {
      formData.append("image", imageInputRef.current.files[0]);
    }

    try {
      const res = await fetch(
        "https://course-selling-app.saveneed.com/api/auth/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Update failed:", errorText);
        throw new Error("Update failed");
      }

      const result = await res.json();
      toast.success("Profile updated successfully");

      // Update localStorage
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...existingUser, ...result.user })
      );

      // Update state
      setProfile({
        id: result.user.id,
        full_name: result.user.full_name,
        email: result.user.email,
        mobile_number: result.user.mobile_number,
        image: result.user.image,
        type: result.user.type,
      });
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={profile.image || "/default-avatar.png"}
              alt="Profile"
              className="object-cover"
            />
            <AvatarFallback>
              {profile.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>

          <div>
            <Label htmlFor="image">Profile Image</Label>
            <input
              id="image"
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <input
            id="full_name"
            name="full_name"
            value={profile.full_name}
            onChange={handleInputChange}
            required
            className="w-full mt-1 p-2 border rounded"
            placeholder="John Doe"
          />
          <p className="text-sm text-gray-500 mt-1">
            (Required) Full name of the user
          </p>
        </div>

        {/* Mobile Number */}
        <div>
          <Label htmlFor="mobile_number">Mobile Number *</Label>
          <input
            id="mobile_number"
            name="mobile_number"
            type="tel"
            value={profile.mobile_number}
            onChange={handleInputChange}
            required
            className="w-full mt-1 p-2 border rounded"
            placeholder="01912941836"
          />
          <p className="text-sm text-gray-500 mt-1">
            (Required) Must be unique
          </p>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <input
            id="email"
            name="email"
            type="email"
            value={profile.email || ""}
            onChange={handleInputChange}
            className="w-full mt-1 p-2 border rounded"
            placeholder="abc@gmail.com"
          />
        </div>

        {/* Submit */}
        <Button type="submit" disabled={updating} className="w-full">
          {updating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </Button>
      </form>
    </div>
  );
}
