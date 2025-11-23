import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const effectiveDate = "2024-12-01"; // You can update this
  const lastUpdated = "2024-12-01"; // You can update this

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className=" w-full">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-50 border-b border-blue-100 p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
              Privacy Policy
            </h1>
            <div className="text-center text-gray-600">
              <p>Effective Date: {effectiveDate}</p>
              <p>Last Updated: {lastUpdated}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose prose-lg max-w-none text-gray-700">
              {/* 1. Introduction */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  1. Introduction
                </h2>
                <p className="mb-4">
                  At Grocyon ("we," "us," or "our"), your privacy is important
                  to us. This Privacy Policy explains how we collect, use,
                  disclose, and protect your personal information when you use
                  our mobile application, website, and related services
                  (collectively, the "Services").
                </p>
                <p className="mb-4">
                  We comply with the Personal Information Protection and
                  Electronic Documents Act (PIPEDA) and other applicable
                  provincial privacy laws in Canada.
                </p>
                <p>
                  By using our Services, you agree to the terms of this Privacy
                  Policy.
                </p>
              </section>

              {/* 2. Information We Collect */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  2. Information We Collect
                </h2>
                <p className="mb-4">
                  We collect personal information in the following ways:
                </p>

                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  a. Information You Provide
                </h3>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Name, email address, and contact details</li>
                  <li>Account registration details</li>
                  <li>Delivery address and preferences</li>
                  <li>
                    Payment or billing information (handled securely by
                    third-party processors)
                  </li>
                  <li>
                    Identification and verification details (for vendors and
                    riders)
                  </li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  b. Information Collected Automatically
                </h3>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>
                    Device information (model, operating system, unique
                    identifiers)
                  </li>
                  <li>IP address and browser type</li>
                  <li>Location data (if you enable location services)</li>
                  <li>Usage data such as access times and app activity</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  c. Information from Third Parties
                </h3>
                <p className="mb-2">We may receive information from:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Payment service providers</li>
                  <li>Delivery or logistics partners</li>
                  <li>Public databases and verification agencies</li>
                </ul>
              </section>

              {/* 3. How We Use Your Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="mb-4">We use your personal information to:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Provide, operate, and improve our Services</li>
                  <li>Process and deliver orders</li>
                  <li>Manage payments and payouts</li>
                  <li>
                    Communicate with you about orders, support, and promotions
                  </li>
                  <li>Verify vendor and rider identity and eligibility</li>
                  <li>
                    Ensure compliance with Canadian laws and platform policies
                  </li>
                  <li>Conduct analytics to enhance user experience</li>
                </ul>
                <p>
                  We will only use your personal information for the purposes
                  identified at the time of collection or as otherwise permitted
                  by law.
                </p>
              </section>

              {/* 4. Sharing of Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  4. Sharing of Information
                </h2>
                <p className="mb-4">We may share your information with:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Vendors and Restaurants: To process your orders</li>
                  <li>Riders: To fulfill deliveries</li>
                  <li>
                    Service Providers: For payment, hosting, analytics, and
                    support
                  </li>
                  <li>Government or Law Enforcement: When required by law</li>
                </ul>
                <p className="font-semibold">
                  We do not sell or rent personal information to third parties.
                </p>
              </section>

              {/* 5. Location Information */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  5. Location Information
                </h2>
                <p className="mb-4">
                  We may collect and use precise location data:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>To show nearby vendors or restaurants</li>
                  <li>To deliver orders efficiently</li>
                  <li>To track deliveries in real time</li>
                </ul>
                <p>
                  You may disable location permissions at any time in your
                  device settings, but some features may not work properly.
                </p>
              </section>

              {/* 6. Data Retention */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  6. Data Retention
                </h2>
                <p className="mb-4">
                  We retain personal information only as long as necessary to:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Provide our Services</li>
                  <li>Meet legal or regulatory obligations</li>
                  <li>Resolve disputes or enforce our agreements</li>
                </ul>
                <p>
                  When no longer needed, data is securely deleted or anonymized.
                </p>
              </section>

              {/* 7. Data Security */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  7. Data Security
                </h2>
                <p className="mb-4">
                  We use reasonable technical and organizational measures to
                  protect your data from:
                </p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Unauthorized access</li>
                  <li>Loss or misuse</li>
                  <li>Alteration or disclosure</li>
                </ul>
                <p className="italic">
                  However, no online system is 100% secure, and you acknowledge
                  that you use our Services at your own risk.
                </p>
              </section>

              {/* 8. Your Rights */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  8. Your Rights
                </h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc list-inside mb-4 space-y-2">
                  <li>Access your personal information</li>
                  <li>Request correction of inaccurate data</li>
                  <li>
                    Withdraw consent for data processing (where applicable)
                  </li>
                  <li>Request deletion of your account and data</li>
                </ul>
                <p className="font-semibold">
                  To exercise these rights, contact us at privacy@grocyon.ca.
                </p>
              </section>

              {/* 9. Children's Privacy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  9. Children's Privacy
                </h2>
                <p className="mb-4">
                  Our Services are intended for users 18 years and older. We do
                  not knowingly collect personal information from minors.
                </p>
                <p>
                  If you believe a child has provided personal information,
                  please contact us for immediate deletion.
                </p>
              </section>

              {/* 10. International Transfers */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  10. International Transfers
                </h2>
                <p>
                  Although our Services operate in Canada, your data may be
                  processed by service providers in other countries. In such
                  cases, we ensure that appropriate safeguards are in place to
                  protect your information.
                </p>
              </section>

              {/* 11. Changes to This Privacy Policy */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  11. Changes to This Privacy Policy
                </h2>
                <p>
                  We may update this Privacy Policy periodically. Any changes
                  will be posted with a new effective date, and continued use of
                  our Services means you accept the updated version.
                </p>
              </section>

              {/* 12. Contact Us */}
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  12. Contact Us
                </h2>
                <p className="mb-4">
                  If you have any questions or concerns about this Privacy
                  Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 mb-1">
                        Grocyon Privacy Office
                      </p>
                      <p className="font-medium text-gray-800">
                        Email: privacy@grocyon.ca
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Address</p>
                      <p className="font-medium text-gray-800">
                        [Insert Company Address, City, Province, Canada]
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Action Button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={handleBack}
                className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                I Understand
              </button>
            </div>

            {/* Footer Notice */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Please read this privacy policy carefully. By using our services,
              you acknowledge that you have read and understood this policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
