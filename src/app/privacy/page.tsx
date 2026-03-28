export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-white font-sans py-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold mb-4">Privacy Policy</h1>
          <p className="text-stone-400">
            Last updated: March 2026
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
            <p className="text-stone-400 leading-relaxed">
              Pocketed by Zamn Studios ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
            <p className="text-stone-400 leading-relaxed mb-4">
              We collect information you provide directly to us:
            </p>
            <ul className="text-stone-400 space-y-3 ml-4">
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span><strong>Account Information:</strong> Email address, name, and password when you create an account</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span><strong>Purchase Data:</strong> Information about your purchases, refunds, and transactions necessary to help recover your refunds</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span><strong>Device Information:</strong> Browser type, IP address, and usage patterns to improve our service</span>
              </li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
            <p className="text-stone-400 leading-relaxed mb-4">
              We use the information we collect for the following purposes:
            </p>
            <ul className="text-stone-400 space-y-3 ml-4">
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span>To provide, maintain, and improve our refund recovery service</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span>To process your requests and assist with refund claims</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span>To send transactional emails and service updates</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span>To detect and prevent fraud and other illegal activities</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span>To comply with legal obligations and enforce our agreements</span>
              </li>
            </ul>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Data Protection</h2>
            <p className="text-stone-400 leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
            </p>
            <ul className="text-stone-400 space-y-3 ml-4">
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span>End-to-end encryption of sensitive data</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span>Secure authentication and session management</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span>Regular security audits and vulnerability assessments</span>
              </li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Data Sharing</h2>
            <p className="text-stone-400 leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We only share your information when necessary to provide our service, comply with legal requirements, or protect our rights. We may share limited information with payment processors and service providers solely to facilitate refund claims.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Your Privacy Rights</h2>
            <p className="text-stone-400 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="text-stone-400 space-y-3 ml-4">
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span><strong>GDPR (EU):</strong> Right to access, rectify, erase, and port your data; right to restrict processing</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span><strong>CCPA (California):</strong> Right to know, delete, and opt-out of data sales; right to non-discrimination</span>
              </li>
              <li className="flex gap-3">
                <span className="text-amber-400 flex-shrink-0">•</span>
                <span>Right to withdraw consent at any time</span>
              </li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Data Retention</h2>
            <p className="text-stone-400 leading-relaxed">
              We retain your personal information for as long as necessary to provide our service and comply with legal obligations. You may request deletion of your account and associated data at any time, subject to legal requirements.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="text-stone-400 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us at:
            </p>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <p className="text-white">
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:mittxldesigns@gmail.com"
                  className="text-amber-400 hover:text-amber-300 transition"
                >
                  mittxldesigns@gmail.com
                </a>
              </p>
              <p className="text-stone-400 mt-4 text-sm">
                We will respond to your request within 30 days or as required by law.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
            <p className="text-stone-400 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by updating the "Last updated" date at the top of this policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
