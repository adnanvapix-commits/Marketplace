import { createClient } from "@/lib/supabase/server";
import HelpClient from "./HelpClient";

const FAQS = [
  {
    category: "Getting Started",
    items: [
      { q: "How do I create an account?", a: "Click 'Login / Sign Up' from the navbar, fill in your details and submit. You'll receive a confirmation email." },
      { q: "How long does verification take?", a: "Our team reviews every business manually. Verification typically takes 24–48 hours on business days." },
      { q: "What documents are needed for verification?", a: "No documents are required at signup. Our team reviews your profile details and may contact you if additional information is needed." },
    ],
  },
  {
    category: "Subscription & Billing",
    items: [
      { q: "What plans are available?", a: "We offer three monthly plans: Beginner (AED 500/mo), Expert (AED 800/mo), and Elite (AED 1,000/mo). Each tier offers more visibility and features." },
      { q: "How do I subscribe or upgrade?", a: "Visit the Subscription page from the navbar and click Upgrade or Subscribe. You'll be connected with our team to complete the process." },
      { q: "What happens when my subscription expires?", a: "You'll lose access to the marketplace browsing and listing features. Your account and data remain safe. Renew at any time." },
    ],
  },
  {
    category: "Buying & Selling",
    items: [
      { q: "Do I need a subscription to browse products?", a: "Yes — verified and subscribed users get full access to all listings to ensure only serious buyers interact with sellers." },
      { q: "How do I contact a seller?", a: "On any product page, click 'Chat with Seller' to start a conversation directly through the platform." },
      { q: "Can I post listings without a subscription?", a: "You need to be verified and subscribed to post products. This keeps the marketplace high quality for everyone." },
    ],
  },
  {
    category: "Account & Profile",
    items: [
      { q: "How do I update my profile?", a: "Go to Profile → Edit Profile to update your name, company, phone, and country." },
      { q: "Can I change my email address?", a: "Email changes require admin assistance. Please raise a support ticket and we'll help you." },
      { q: "How do I delete my account?", a: "Account deletion requests must be submitted via a support ticket. Your data will be removed within 7 business days." },
    ],
  },
];

export default async function HelpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user's existing tickets if logged in
  let myTickets: {
    id: string; category: string; subject: string;
    status: string; created_at: string; admin_reply: string | null;
  }[] = [];

  if (user) {
    const { data } = await supabase
      .from("support_tickets")
      .select("id, category, subject, status, created_at, admin_reply")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    myTickets = (data ?? []) as typeof myTickets;
  }

  return (
    <HelpClient
      faqs={FAQS}
      isLoggedIn={!!user}
      userEmail={user?.email ?? ""}
      myTickets={myTickets}
    />
  );
}
