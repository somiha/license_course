"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface PolicyInfo {
  id: number;
  about_us: string;
  terms_condition: string;
  privacy_policy: string;
  created_at: string;
  updated_at: string;
}

export default function TermsAndConditionsPage() {
  const [policy, setPolicy] = useState<PolicyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    about_us: "",
    terms_condition: "",
    privacy_policy: "",
  });

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Missing auth token");

      const response = await fetch(
        "https://course-selling-app.saveneed.com/api/policy-info",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();

      // ✅ Match actual API shape: { policy: { ... } }
      if (data && data.policy) {
        const p = data.policy;
        setPolicy(p);
        setFormData({
          about_us: p.about_us || "",
          terms_condition: p.terms_condition || "",
          privacy_policy: p.privacy_policy || "",
        });
      } else {
        throw new Error("Invalid API response: missing policy object");
      }
    } catch (error) {
      console.error("Fetch policy error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load policies"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Missing auth token");

      // ✅ Include the policy ID in the URL
      const url = `https://course-selling-app.saveneed.com/api/policy-info/${policy?.id}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      toast.success(data.message || "Policy updated successfully!");
      setEditMode(false);
      fetchPolicy(); // refetch to get full updated data
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update policies"
      );
    }
  };

  const renderContent = (html: string) => {
    return html
      .split("\n")
      .filter((paragraph) => paragraph.trim() !== "")
      .map((p, i) => <p key={i} dangerouslySetInnerHTML={{ __html: p }} />);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Policy Information</h2>
        {!editMode && (
          <Button
            className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
            onClick={() => setEditMode(true)}
          >
            Edit Policies
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* About Us */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            {editMode ? (
              <Textarea
                name="about_us"
                value={formData.about_us}
                onChange={handleInputChange}
                className="min-h-[200px]"
              />
            ) : (
              <div className="prose max-w-none">
                {renderContent(policy?.about_us || "")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Terms & Conditions</h3>
            {editMode ? (
              <Textarea
                name="terms_condition"
                value={formData.terms_condition}
                onChange={handleInputChange}
                className="min-h-[200px]"
              />
            ) : (
              <div className="prose max-w-none">
                {renderContent(policy?.terms_condition || "")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy Policy */}
        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Privacy Policy</h3>
            {editMode ? (
              <Textarea
                name="privacy_policy"
                value={formData.privacy_policy}
                onChange={handleInputChange}
                className="min-h-[300px]"
              />
            ) : (
              <div className="prose max-w-none">
                {renderContent(policy?.privacy_policy || "")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editMode && (
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[rgb(var(--gradient-from))] via-[rgb(var(--gradient-via))] to-[rgb(var(--gradient-to))] text-white hover:opacity-90"
          >
            Save All Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditMode(false);
              if (policy) {
                setFormData({
                  about_us: policy.about_us,
                  terms_condition: policy.terms_condition,
                  privacy_policy: policy.privacy_policy,
                });
              }
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
