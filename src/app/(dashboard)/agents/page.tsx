"use client";

import { DataTable } from "../data-table";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ApiAgent {
  id: number;
  full_name: string;
  email: string;
  phone_no: string;
  isApproved: boolean;
  type: "agent";
  status: "active" | "hold" | "blocked";
  image?: string | null;
  canReceiveRemittanceList?: boolean;
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
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<ApiAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("authToken");

      if (!userStr || !token) {
        throw new Error("Authentication required");
      }

      const currentUser = JSON.parse(userStr);
      const response = await fetch(
        `https://api.t-coin.code-studio4.com/api/admins/${currentUser.id}/agents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch agents");
      }

      setAgents(data.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const formattedAgents = agents.map((agent) => ({
    id: agent.id.toString(),
    name: agent.full_name,
    email: agent.email,
    phone: agent.phone_no,
    type: agent.type,
    status: agent.status,
    isApproved: agent.isApproved,
    canReceiveRemittanceList: agent.canReceiveRemittanceList || false,
    image: agent.image,
    address: agent.address,
    city: agent.city,
    country: agent.country,
    state: agent.state,
    zip_code: agent.zip_code,
    nid_card_number: agent.nid_card_number,
    nid_card_front_pic_url: agent.nid_card_front_pic_url,
    nid_card_back_pic_url: agent.nid_card_back_pic_url,
    passport_file_url: agent.passport_file_url,
    qr_code: agent.qr_code,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
    tcoin_balance: agent.tcoin_balance,
    local_currency_balance: agent.local_currency_balance,
    accepted_terms: agent.accepted_terms,
    birth_date: agent.birth_date,
    institution_name: agent.institution_name,
  }));

  const filteredAgents = formattedAgents.filter((agent) => {
    const query = searchQuery.toLowerCase();
    return (
      agent.name?.toLowerCase().includes(query) ||
      agent.email?.toLowerCase().includes(query) ||
      agent.phone?.toLowerCase().includes(query) ||
      agent.country?.toLowerCase().includes(query) ||
      agent.city?.toLowerCase().includes(query) ||
      agent.state?.toLowerCase().includes(query) ||
      agent.address?.toLowerCase().includes(query) ||
      agent.zip_code?.toLowerCase().includes(query) ||
      agent.birth_date?.toLowerCase().includes(query) ||
      agent.institution_name?.toLowerCase().includes(query) ||
      agent.qr_code?.toLowerCase().includes(query) ||
      agent.nid_card_number?.toLowerCase().includes(query) ||
      agent.passport_file_url?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">My Agents</h1>
            </div>
            <div className="mb-4">
              <div className="mb-4 relative">
                <Input
                  placeholder="Search Agent"
                  className="max-w-sm pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute p-1 h-6 w-6 text-gray-400 left-2 top-2" />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-500 p-4">{error}</div>
            ) : (
              <DataTable columns={columns(fetchAgents)} data={filteredAgents} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
