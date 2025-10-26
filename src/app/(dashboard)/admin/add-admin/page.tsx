"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export default function AddAdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_no: "",
    nid_card_number: "",
    pin_number: "",
    country: "Bangladesh",
  });

  const [terms, setTerms] = useState({
    title: "Terms and Conditions",
    content: "",
    active_status: false,
  });
  const [termsLoading, setTermsLoading] = useState(true);
  const [termsError, setTermsError] = useState("");

  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const imageRef = useRef<HTMLInputElement>(null);
  const nidFrontRef = useRef<HTMLInputElement>(null);
  const nidBackRef = useRef<HTMLInputElement>(null);
  const passportRef = useRef<HTMLInputElement>(null);

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await fetch(
          "https://api.t-coin.code-studio4.com/api/terms-and-conditions"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch terms and conditions");
        }

        const data = await response.json();
        setTerms({
          title: data.data.termsOfService.title,
          content: data.data.termsOfService.content,
          active_status: data.data.termsOfService.active,
        });
      } catch (err) {
        setTermsError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching terms:", err);
      } finally {
        setTermsLoading(false);
      }
    };

    fetchTerms();
  }, []);

  useEffect(() => {
    const isValid =
      formData.full_name.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone_no.trim() !== "" &&
      formData.nid_card_number.trim() !== "" &&
      formData.pin_number.trim() !== "" &&
      acceptedTerms;

    setIsFormValid(isValid);
  }, [formData, acceptedTerms]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);

    try {
      // Verify super admin is logged in
      const token = localStorage.getItem("authToken");
      const currentUserStr = localStorage.getItem("user");

      if (!token || !currentUserStr) {
        throw new Error("Authentication required");
      }

      const currentUser = JSON.parse(currentUserStr);

      // 1. Create the admin
      const formDataToSend = new FormData();
      formDataToSend.append("full_name", formData.full_name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone_no", formData.phone_no);
      formDataToSend.append("nid_card_number", formData.nid_card_number);
      formDataToSend.append("pin_number", formData.pin_number);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("type", "admin");
      formDataToSend.append("accepted_terms", String(acceptedTerms));

      if (imageRef.current?.files?.[0]) {
        formDataToSend.append("image", imageRef.current.files[0]);
      }
      if (nidFrontRef.current?.files?.[0]) {
        formDataToSend.append("nid_card_front", nidFrontRef.current.files[0]);
      }
      if (nidBackRef.current?.files?.[0]) {
        formDataToSend.append("nid_card_back", nidBackRef.current.files[0]);
      }
      if (passportRef.current?.files?.[0]) {
        formDataToSend.append("passport", passportRef.current.files[0]);
      }

      // Create the admin
      const createResponse = await fetch(
        "https://api.t-coin.code-studio4.com/api/admins/with-multiple-files",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(createData.message || "Failed to create admin");
      }

      // 2. Automatically approve the admin
      const adminId = createData.data.id;

      const approveResponse = await fetch(
        `https://api.t-coin.code-studio4.com/api/super-admin/${currentUser.id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            approveUserId: adminId,
            type: "admin",
            approveStatus: true,
          }),
        }
      );

      if (!approveResponse.ok) {
        const approveData = await approveResponse.json();
        throw new Error(approveData.message || "Failed to auto-approve admin");
      }

      // Success
      toast.success("Admin created and approved successfully");

      // Redirect to admin list
      router.push("/admins");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setErrorModalOpen(true);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] p-4">
      <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Error</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{errorMessage}</p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setErrorModalOpen(false)}
              className="bg-[#71113D] hover:bg-[#5a0f2f]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="w-full max-w-2xl bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-[#3F1729] via-[#71113D] to-[#D4136B] h-2 w-full"></div>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-[#3F1729] via-[#71113D] to-[#D4136B] text-transparent bg-clip-text">
              Add New Admin
            </h1>
            <p className="text-gray-600">
              Create and automatically approve a new admin account
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="full_name"
                  placeholder="Your full name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-[#71113D] focus:ring-1 focus:ring-[#71113D]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-[#71113D] focus:ring-1 focus:ring-[#71113D]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_no" className="text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone_no"
                  placeholder="+8801XXXXXXXXX"
                  value={formData.phone_no}
                  onChange={handleInputChange}
                  className="bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-[#71113D] focus:ring-1 focus:ring-[#71113D]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nid_card_number" className="text-gray-700">
                  NID Card Number *
                </Label>
                <Input
                  id="nid_card_number"
                  placeholder="Enter NID number"
                  value={formData.nid_card_number}
                  onChange={handleInputChange}
                  className="bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-[#71113D] focus:ring-1 focus:ring-[#71113D]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin_number" className="text-gray-700">
                  PIN Number *
                </Label>
                <Input
                  id="pin_number"
                  type="password"
                  placeholder="••••••"
                  value={formData.pin_number}
                  onChange={handleInputChange}
                  className="bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-[#71113D] focus:ring-1 focus:ring-[#71113D]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-700">
                  Country
                </Label>
                <Input
                  id="country"
                  placeholder="Your country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="bg-white text-gray-900 border-gray-300 hover:border-gray-400 focus:border-[#71113D] focus:ring-1 focus:ring-[#71113D]"
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-gray-700 block">
                      Profile Image *
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      ref={imageRef}
                      className="block w-full bg-white text-gray-900 border-gray-300 hover:border-gray-400 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#f3f4f6] file:text-gray-700 hover:file:bg-[#e5e7eb]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nid_front" className="text-gray-700 block">
                      NID Card Front *
                    </Label>
                    <Input
                      id="nid_front"
                      type="file"
                      ref={nidFrontRef}
                      className="block w-full bg-white text-gray-900 border-gray-300 hover:border-gray-400 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#f3f4f6] file:text-gray-700 hover:file:bg-[#e5e7eb]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nid_back" className="text-gray-700 block">
                      NID Card Back *
                    </Label>
                    <Input
                      id="nid_back"
                      type="file"
                      ref={nidBackRef}
                      className="block w-full bg-white text-gray-900 border-gray-300 hover:border-gray-400 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#f3f4f6] file:text-gray-700 hover:file:bg-[#e5e7eb]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passport" className="text-gray-700 block">
                      Passport (optional)
                    </Label>
                    <Input
                      id="passport"
                      type="file"
                      ref={passportRef}
                      className="block w-full bg-white text-gray-900 border-gray-300 hover:border-gray-400 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#f3f4f6] file:text-gray-700 hover:file:bg-[#e5e7eb]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-start space-x-3">
                <Checkbox
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#71113D] focus:ring-[#71113D]"
                />
                <span className="text-sm text-gray-600">
                  I confirm that this admin agrees to the{" "}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-[#71113D] font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-[#71113D] focus:ring-offset-2 rounded"
                      >
                        Terms and Conditions
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-[#3F1729]">
                          {terms.title}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-gray-700">
                        {termsLoading ? (
                          <p>Loading terms and conditions...</p>
                        ) : termsError ? (
                          <p className="text-red-500">{termsError}</p>
                        ) : !terms.active_status ? (
                          <p>Terms and conditions are currently unavailable.</p>
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{ __html: terms.content }}
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full bg-gradient-to-r from-[#3F1729] via-[#71113D] to-[#D4136B] text-white font-medium py-3 px-4 rounded-lg transition-opacity shadow-md ${
                isFormValid && !isLoading
                  ? "hover:opacity-90 cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Creating Admin..." : "Add Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
