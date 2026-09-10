import { redirect } from "next/navigation";

export const metadata = { title: "Home | BULKORA" };

export default function HomePage() {
  // Redirect /home to the landing page at /
  redirect("/");
}
