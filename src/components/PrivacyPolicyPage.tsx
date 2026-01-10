import React, { useState } from "react";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  User,
  MapPin,
  Database,
  Key,
  Globe,
  Users,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  X,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleBack = () => {
    navigate(-1);
  };

  const effectiveDate = "2024-12-01";
  const lastUpdated = "2024-12-01";

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
      setTimeout(() => setActiveSection(null), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Elegant Header */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Shield className="w-8 h-8 text-gray-700" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              Privacy Policy
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Effective Date: {effectiveDate}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: {lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-5xl">
        <div className="bg-white shadow-lg border border-gray-200">
          {/* Document Header */}
          <div className="border-b border-gray-200 px-8 pt-8 pb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Legal Document</p>
            <p className="text-gray-700 text-sm leading-relaxed max-w-3xl">
              This Privacy Policy describes how Grocyon ("we," "us," or "our") collects, uses, and protects your personal information when you use our services.
            </p>
          </div>

          <div className="px-8 py-8 space-y-8">

            {/* 1. Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                1. Introduction
              </h2>
              <div className="text-gray-700 leading-relaxed space-y-4 mt-5">
                <p className="text-base leading-7">
                  At Grocyon ("we," "us," or "our"), your privacy is of utmost importance
                  to us. This Privacy Policy explains how we collect, use,
                  disclose, and protect your personal information when you use
                  our mobile application, website, and related services
                  (collectively, the "Services").
                </p>
                <p className="text-base leading-7">
                  We comply with the Personal Information Protection and
                  Electronic Documents Act (PIPEDA) and other applicable
                  provincial privacy laws in Canada.
                </p>
                <p className="text-base leading-7 font-medium text-gray-900">
                  By using our Services, you agree to the terms of this Privacy
                  Policy.
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section id="information" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                2. Information We Collect
              </h2>
              <p className="text-gray-700 mb-5 text-base leading-7">
                We collect personal information in the following ways:
              </p>

              <div className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-2">
                    2.1. Information You Provide
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-5 text-base leading-7">
                    <li>Name, email address, and contact details</li>
                    <li>Account registration details</li>
                    <li>Delivery address and preferences</li>
                    <li>Payment or billing information (handled securely by third-party processors)</li>
                    <li>Identification and verification details (for vendors and riders)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-2">
                    2.2. Information Collected Automatically
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-5 text-base leading-7">
                    <li>Device information (model, operating system, unique identifiers)</li>
                    <li>IP address and browser type</li>
                    <li>Location data (if you enable location services)</li>
                    <li>Usage data such as access times and app activity</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-2">
                    2.3. Information from Third Parties
                  </h3>
                  <p className="text-gray-700 mb-2.5 text-base leading-7">We may receive information from:</p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-5 text-base leading-7">
                    <li>Payment service providers</li>
                    <li>Delivery or logistics partners</li>
                    <li>Public databases and verification agencies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. How We Use Your Information */}
            <section id="usage" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 mb-5 text-base leading-7">
                We use your personal information to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-5 text-base leading-7 mb-5">
                <li>Provide, operate, and improve our Services</li>
                <li>Process and deliver orders</li>
                <li>Manage payments and payouts</li>
                <li>Communicate with you about orders, support, and promotions</li>
                <li>Verify vendor and rider identity and eligibility</li>
                <li>Ensure compliance with Canadian laws and platform policies</li>
                <li>Conduct analytics to enhance user experience</li>
              </ul>
              <p className="text-gray-700 text-base leading-7">
                We will only use your personal information for the purposes
                identified at the time of collection or as otherwise permitted
                by law.
              </p>
            </section>

            {/* 4. Sharing of Information */}
            <section className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                4. Sharing of Information
              </h2>
              <p className="text-gray-700 mb-5 text-base leading-7">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-5 text-base leading-7 mb-5">
                <li><strong>Vendors and Restaurants:</strong> To process your orders</li>
                <li><strong>Riders:</strong> To fulfill deliveries</li>
                <li><strong>Service Providers:</strong> For payment, hosting, analytics, and support</li>
                <li><strong>Government or Law Enforcement:</strong> When required by law</li>
              </ul>
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 my-5">
                <p className="text-gray-900 font-semibold text-base leading-7">
                  We do not sell or rent personal information to third parties.
                </p>
              </div>
            </section>

            {/* 5. Location Information */}
            <section className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                5. Location Information
              </h2>
              <p className="text-gray-700 mb-5 text-base leading-7">
                We may collect and use precise location data:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-5 text-base leading-7 mb-5">
                <li>To show nearby vendors or restaurants</li>
                <li>To deliver orders efficiently</li>
                <li>To track deliveries in real time</li>
              </ul>
              <p className="text-gray-700 text-base leading-7">
                You may disable location permissions at any time in your
                device settings, but some features may not work properly.
              </p>
            </section>

            {/* 6. Data Retention */}
            <section className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                6. Data Retention
              </h2>
              <p className="text-gray-700 mb-5 text-base leading-7">
                We retain personal information only as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-5 text-base leading-7 mb-5">
                <li>Provide our Services</li>
                <li>Meet legal or regulatory obligations</li>
                <li>Resolve disputes or enforce our agreements</li>
              </ul>
              <p className="text-gray-700 text-base leading-7">
                When no longer needed, data is securely deleted or anonymized.
              </p>
            </section>

            {/* 7. Data Security */}
            <section id="security" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                7. Data Security
              </h2>
              <p className="text-gray-700 mb-5 text-base leading-7">
                We use reasonable technical and organizational measures to
                protect your data from:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-5 text-base leading-7 mb-5">
                <li>Unauthorized access</li>
                <li>Loss or misuse</li>
                <li>Alteration or disclosure</li>
              </ul>
              <p className="text-gray-700 text-base leading-7 italic">
                However, no online system is 100% secure, and you acknowledge
                that you use our Services at your own risk.
              </p>
            </section>

            {/* 8. Your Rights */}
            <section id="rights" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                8. Your Rights
              </h2>
              <p className="text-gray-700 mb-5 text-base leading-7">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2.5 ml-5 text-base leading-7 mb-5">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Withdraw consent for data processing (where applicable)</li>
                <li>Request deletion of your account and data</li>
              </ul>
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 my-5">
                <p className="text-gray-900 font-semibold text-base leading-7">
                  To exercise these rights, contact us at: <a href="mailto:privacy@grocyon.ca" className="text-red-600 hover:underline">privacy@grocyon.ca</a>
                </p>
              </div>
            </section>

            {/* 9. Children's Privacy */}
            <section className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 mb-4 text-base leading-7">
                Our Services are intended for users <strong>18 years and older</strong>. We do
                not knowingly collect personal information from minors.
              </p>
              <p className="text-gray-700 text-base leading-7">
                If you believe a child has provided personal information,
                please contact us for immediate deletion.
              </p>
            </section>

            {/* 10. International Transfers */}
            <section className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                10. International Transfers
              </h2>
              <p className="text-gray-700 text-base leading-7">
                Although our Services operate in Canada, your data may be
                processed by service providers in other countries. In such
                cases, we ensure that <strong>appropriate safeguards</strong> are in place to
                protect your information.
              </p>
            </section>

            {/* 11. Changes to This Privacy Policy */}
            <section className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 text-base leading-7">
                We may update this Privacy Policy periodically. Any changes
                will be posted with a new effective date, and continued use of
                our Services means you accept the updated version.
              </p>
            </section>

            {/* 12. Contact Us */}
            <section id="contact" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2.5">
                12. Contact Us
              </h2>
              <p className="text-gray-700 mb-5 text-base leading-7">
                If you have any questions or concerns about this Privacy
                Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-4">
                <div className="space-y-5">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-medium">Email</p>
                    <p className="text-gray-900 font-semibold text-base mb-1">
                      <a href="mailto:privacy@grocyon.ca" className="text-red-600 hover:underline">privacy@grocyon.ca</a>
                    </p>
                    <p className="text-gray-600 text-sm">Grocyon Privacy Office</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-medium">Address</p>
                    <p className="text-gray-900 font-semibold text-base">
                      Medicine Hat, Alberta, Canada
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Document Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-8 py-6">
            <p className="text-xs text-gray-500 text-center leading-relaxed mb-4">
              Please read this privacy policy carefully. By using our services,
              you acknowledge that you have read and understood this policy.
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
