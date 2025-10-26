import { UserTable } from "@/components/UserTable";

export default function AdminsPage() {
  return (
    <UserTable
      userType="admin"
      title="Admin Management"
      addButtonHref="/admin/add-admin"
    />
  );
}
