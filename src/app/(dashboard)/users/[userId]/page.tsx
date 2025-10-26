"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface UserType {
  id: number;
  full_name: string;
  email: string;
  phone_no: string;
  country: string;
  address: string | null;
  image?: string | null;
  nid_card_number?: string;
  nid_card_front_pic_url?: string;
  nid_card_back_pic_url?: string;
}

export default function UserDetailsPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<UserType | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Missing auth token");
      return;
    }

    // Fetch user list
    fetch("https://api.t-coin.code-studio4.com/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          const foundUser = data.data.find(
            (u: UserType) => String(u.id) === String(userId)
          );

          if (foundUser) {
            setUser(foundUser);

            // Fetch user balance
            fetch(
              `https://api.t-coin.code-studio4.com/api/users/${foundUser.id}/user-balance`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            )
              .then((res) => res.json())
              .then((balanceData) => {
                if (balanceData.success) {
                  setBalance(balanceData.data?.balance || "0.00");
                }
              })
              .catch((err) => console.error("Balance fetch error:", err));
          } else {
            setUser(null);
          }
        } else {
          console.error("Invalid user list");
        }
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">User Details</h2>

      <Card className="w-full">
        <CardContent className="p-6 space-y-6 lg:pl-16 md:pl-1">
          {/* Profile Image */}
          <div className="w-full max-w-[600px]">
            <Label className="block mb-2 text-md font-medium">Image</Label>
            <Image
              src={user.image || "/default-avatar.png"}
              alt={user.full_name}
              width={150}
              height={140}
              className="rounded-md border object-cover"
            />
          </div>

          {/* Full Name */}
          <div className="w-full max-w-[600px]">
            <Label className="block mb-4 text-md font-medium">Full Name</Label>
            <Input value={user.full_name} readOnly />
          </div>

          {/* Email */}
          <div className="w-full max-w-[600px]">
            <Label className="block mb-4 text-md font-medium">Email</Label>
            <Input value={user.email} readOnly />
          </div>

          {/* Phone */}
          <div className="w-full max-w-[600px]">
            <Label className="block mb-4 text-md font-medium">Phone</Label>
            <Input value={user.phone_no} readOnly />
          </div>

          {/* Country */}
          <div className="w-full max-w-[600px]">
            <Label className="block mb-4 text-md font-medium">Country</Label>
            <Input value={user.country} readOnly />
          </div>

          {/* Address */}
          <div className="w-full max-w-[600px]">
            <Label className="block mb-4 text-md font-medium">Address</Label>
            <Input value={user.address || "N/A"} readOnly />
          </div>

          {/* NID Number */}
          <div className="w-full max-w-[600px]">
            <Label className="block mb-4 text-md font-medium">NID Number</Label>
            <Input value={user.nid_card_number || "N/A"} readOnly />
          </div>

          {/* Balance */}
          <div className="w-full max-w-[600px]">
            <Label className="block mb-4 text-md font-medium">Balance</Label>
            <Input value={balance ?? "Loading..."} readOnly />
          </div>

          {/* NID Front & Back */}
          <Card className="mt-6 w-full max-w-xl">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* NID Front */}
                <div className="bg-white rounded-md h-48 flex flex-col items-center justify-center border border-[#FFDCEC]">
                  <p className="text-sm mb-2">Front Side of NID</p>
                  <Image
                    src={
                      user.nid_card_front_pic_url ||
                      "/nid-front-placeholder.png"
                    }
                    alt="NID Front"
                    width={80}
                    height={80}
                    className="mx-auto"
                  />
                </div>

                {/* NID Back */}
                <div className="bg-white rounded-md h-48 flex flex-col items-center justify-center border border-[#FFDCEC]">
                  <p className="text-sm mb-2">Back Side of NID</p>
                  <Image
                    src={
                      user.nid_card_back_pic_url || "/nid-back-placeholder.png"
                    }
                    alt="NID Back"
                    width={80}
                    height={80}
                    className="mx-auto"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
