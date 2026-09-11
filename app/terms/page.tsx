import Link from "next/link";
import { FileText } from "lucide-react";

const LAST_UPDATED = "September 2026";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using BULKORA ("the Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Platform. These terms apply to all users including buyers, sellers, and visitors.`,
  },
  {
    title: "2. Platform Description",
    content: `BULKORA is a B2B wholesale marketplace based in Dubai, UAE, that connects verified businesses for the purpose of wholesale trade. The Platform facilitates introductions and communications between buyers and sellers but is not a party to any transaction between users.`,
  },
  {
    title: "3. Eligibility & Registration",
    content: `To use the Platform, you must:\n• Be a registered business entity or authorized representative\n• Provide accurate and complete information during registration\n• Be at least 18 years of age\n• Not be prohibited from using the Platform under applicable law\n\nAll accounts are subject to manual verification by our team before being granted marketplace access.`,
  },
  {
    title: "4. Subscriptions & Payments",
    content: `Access to the marketplace requires an active subscription. We offer three tiers — Beginner (AED 500/month), Expert (AED 800/month), and Elite (AED 1,000/month). Subscriptions are billed monthly and must be renewed before expiry to maintain access. Payments are processed manually. No refunds are issued once a subscription period has begun unless otherwise agreed in writing.`,
  },
  {
    title: "5. User Conduct",
    content: `You agree not to:\n• Post false, misleading, or fraudulent listings\n• Share contact information (phone, email, WhatsApp) in product listings or chat to circumvent the platform\n• Harass, abuse, or harm other users\n• Attempt to gain unauthorized access to other accounts or systems\n• Use the Platform for any illegal or prohibited purpose\n• Scrape, copy, or redistribute Platform content without permission\n\nViolations may result in immediate account suspension or termination without refund.`,
  },
  {
    title: "6. Product Listings",
    content: `Sellers are solely responsible for the accuracy, legality, and quality of their listings. BULKORA does not verify product claims, quality, or availability. Sellers must ensure listings comply with UAE law and international trade regulations. BULKORA reserves the right to remove any listing at its sole discretion.`,
  },
  {
    title: "7. Communication & Contact Restrictions",
    content: `To protect the integrity of the marketplace, users are prohibited from sharing personal contact details in public-facing areas of the Platform. Direct communication is permitted through the Platform's built-in messaging system. Violation of this policy may result in account termination.`,
  },
  {
    title: "8. Intellectual Property",
    content: `All content on the Platform including logos, design, text, and software is the property of BULKORA and protected by applicable intellectual property laws. Users retain ownership of content they upload but grant BULKORA a non-exclusive license to display and use such content for platform operations.`,
  },
  {
    title: "9. Disclaimers & Limitation of Liability",
    content: `The Platform is provided "as is" without warranties of any kind. BULKORA does not guarantee the accuracy of listings, the conduct of users, or the completion of any transaction. To the maximum extent permitted by law, BULKORA shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.`,
  },
  {
    title: "10. Account Termination",
    content: `BULKORA reserves the right to suspend or terminate any account at any time for violation of these Terms, fraudulent activity, or for any reason at our sole discretion. Users may request account deletion by submitting a support ticket.`,
  },
  {
    title: "11. Governing Law",
    content: `These Terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.`,
  },
  {
    title: "12. Changes to Terms",
    content: `We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated date. Continued use of the Platform after changes constitutes acceptance of the new Terms.`,
  },
  {
    title: "13. Contact",
    content: `For questions about these Terms, contact us at support@bulkora.com or visit our Help & Support page.`,
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <FileText size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Terms & Conditions</h1>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Please read these Terms and Conditions carefully before using BULKORA. By accessing or using our Platform, you agree to be bound by these terms.
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {SECTIONS.map(({ title, content }) => (
          <div key={title} className="card p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-2">{title}</h2>
            <div className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>
        ))}
      </div>

      {/* Footer nav */}
      <div className="mt-8 pt-6 border-t border-cream-200 flex flex-wrap gap-4 text-xs text-gray-400">
        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
        <Link href="/help" className="hover:text-primary transition-colors">Help & Support</Link>
        <Link href="/about" className="hover:text-primary transition-colors">About BULKORA</Link>
      </div>
    </div>
  );
}
