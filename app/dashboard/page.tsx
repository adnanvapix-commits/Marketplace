import { redirect } from "next/navigation";

// Dashboard has been merged into /profile
export default function DashboardPage() {
  redirect("/profile");
}
