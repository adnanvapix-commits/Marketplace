import Link from "next/link";
import { Shield } from "lucide-react";

const LAST_UPDATED = "September 2026";

const SECTIONS = [
  {
    title: "1. Introduction",
    content: `BULKORA ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our B2B marketplace platform located at bulkora.com ("the Platform"). By using the Platform, you consent to the practices described in this policy.`,
  },
  {
    title: "2. Information We Collect",
    content: `We collect the following types of information:\n\n• Account Information: Name, email address, company name, phone number, country, and WhatsApp number provided at registration\n• Profile Data: Business details, product listings, and profile photos you upload\n• Transaction Data: Subscription history, tier level, and payment records\n• Communications: Messages sent through our in-platform chat system\n• Usage Data: Pages visited, search queries, IP address, browser type, and device information\n• Support Data: Tickets and queries submitted to our support team`,
  },
  {
    title: "3. How We Use Your Information",
    content: `We use your information to:\n\n• Provide, operate, and improve the Platform\n• Verify your business identity and grant marketplace access\n• Process subscription payments and manage your account\n• Connect you with other verified buyers and sellers\n• Send transactional emails (account confirmations, subscription updates)\n• Respond to support tickets and customer service inquiries\n• Detect fraud, abuse, and security threats\n• Comply with legal obligations`,
  },
  {
    title: "4. Information Sharing",
    content: `We do not sell your personal data. We may share your information with:\n\n• Other Users: Your company name, profile details, and product listings are visible to verified marketplace members\n• Service Providers: Supabase (database), Vercel (hosting), Cloudinary (image storage) — all bound by data processing agreements\n• Legal Authorities: When required by UAE law, court order, or to protect our rights\n\nWe will never share your private contact details with third parties for marketing purposes.`,
  },
  {
    title: "5. Data Storage & Security",
    content: `Your data is stored on secure servers managed by Supabase with data centers in the European Union. We implement industry-standard security measures including:\n\n• Encrypted connections (HTTPS/TLS)\n• Row-level security policies on all database tables\n• JWT-based authentication with secure session management\n• Regular security reviews\n\nWhile we take all reasonable precautions, no method of transmission over the internet is 100% secure.`,
  },
  {
    title: "6. Cookies",
    content: `We use essential cookies to maintain your session and authentication state. We do not use advertising or tracking cookies. You can control cookies through your browser settings, but disabling essential cookies may prevent you from logging in.`,
  },
  {
    title: "7. Data Retention",
    content: `We retain your personal data for as long as your account is active. If you request account deletion, we will remove your personal data within 7 business days, except where retention is required by law. Product listings and transaction records may be retained for up to 3 years for legal and financial compliance.`,
  },
  {
    title: "8. Your Rights",
    content: `You have the right to:\n\n• Access the personal data we hold about you\n• Correct inaccurate or incomplete information\n• Request deletion of your account and personal data\n• Object to processing of your data in certain circumstances\n• Export your data in a portable format\n\nTo exercise any of these rights, submit a request through our Help & Support page or email support@bulkora.com.`,
  },
  {
    title: "9. Children's Privacy",
    content: `The Platform is intended for business users only. We do not knowingly collect personal information from individuals under 18 years of age. If we become aware that a minor has provided personal data, we will delete it immediately.`,
  },
  {
    title: "10. Third-Party Links",
    content: `The Platform may contain links to third-party websites or services (such as WhatsApp for support). We are not responsible for the privacy practices or content of those third parties. We encourage you to review their privacy policies.`,
  },
  {
    title: "11. Changes to This Policy",
    content: `We may update this Privacy Policy periodically. We will notify users of significant changes by posting a notice on the Platform or sending an email. Continued use of the Platform after changes constitutes your acceptance of the updated policy.`,
  },
  {
    title: "12. Contact Us",
    content: `If you have any questions about this Privacy Policy or how we handle your data, please contact us:\n\nEmail: support@bulkora.com\nAddress: Dubai, United Arab Emirates\n\nOr submit a support ticket through our Help & Support page.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
            <Shield size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Privacy Policy</h1>
            <p className="text-xs text-gray-400 mt-0.5">Last updated: {LAST_UPDATED}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your privacy matters to us. This policy explains how BULKORA collects, uses, and protects your personal information.
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
        <Link href="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
        <Link href="/help" className="hover:text-primary transition-colors">Help & Support</Link>
        <Link href="/about" className="hover:text-primary transition-colors">About BULKORA</Link>
      </div>
    </div>
  );
}
