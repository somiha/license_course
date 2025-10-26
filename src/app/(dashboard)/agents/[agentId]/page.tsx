"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function AgentDetails() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Agent Details</h2>

      <Card className="w-full">
        <CardContent className="p-6 space-y-6 lg:pl-16 md:pl-1">
          {/* Image */}
          <div className="w-full max-w-[600px]">
            <Label className="block mb-2 text-md font-medium">Image</Label>
            <Image
              src="/agent-profile.jpg"
              alt="Agent Image"
              width={150}
              height={140}
              className="rounded-md border object-cover"
            />
          </div>

          <div className="w-full max-w-[600px]">
            <Label
              htmlFor="fullName"
              className="block mb-4 text-md font-medium"
            >
              Full Name
            </Label>
            <Input id="fullName" value="Rashidatul Kobra" readOnly />
          </div>

          <div className="w-full max-w-[600px]">
            <Label htmlFor="email" className="block mb-4 text-md font-medium">
              Email
            </Label>
            <Input id="email" value="kobrarashhi@gmail.com" readOnly />
          </div>

          <div className="w-full max-w-[600px]">
            <Label htmlFor="mobile" className="block mb-4 text-md font-medium">
              Mobile Number
            </Label>
            <Input id="mobile" value="+1 123 456 7890" readOnly />
          </div>

          <div className="w-full max-w-[600px]">
            <Label htmlFor="country" className="block mb-4 text-md font-medium">
              Country
            </Label>
            <Input id="country" value="USA" readOnly />
          </div>

          <div className="w-full max-w-[600px]">
            <Label htmlFor="address" className="block mb-4 text-md font-medium">
              Address
            </Label>
            <Input id="address" value="Los Angeles, CA 90001" readOnly />
          </div>

          <div className="w-full max-w-[600px]">
            <Label htmlFor="nid" className="block mb-4 text-md font-medium">
              NID Card Number
            </Label>
            <Input id="nid" value="2145326753" readOnly />
          </div>
          <Card className="mt-6 w-full max-w-xl">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-md h-48 flex flex-col items-center justify-center border border-[#FFDCEC]">
                  <p className="text-sm mb-2">Front Side of NID Card</p>
                  <Image
                    src="/nid-front-placeholder.png"
                    alt="Front NID"
                    width={80}
                    height={80}
                    className="mx-auto"
                  />
                </div>

                <div className="bg-white rounded-md h-48 flex flex-col items-center justify-center border border-[#FFDCEC]">
                  <p className="text-sm mb-2">Back Side of NID Card</p>
                  <Image
                    src="/nid-back-placeholder.png"
                    alt="Back NID"
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
