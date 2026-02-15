import { useEffect } from "react";
import PageHero from "@/components/sections/PageHero";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="Legal"
        title="Terms of"
        titleAccent="Service"
        description="Please read these terms carefully before using FloSynq or any services provided by Digital Growth Equity Ltd."
      />

      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl space-y-12">
            <p className="text-sm text-muted-foreground">Last updated: 15 February 2026</p>

            {/* 1. Acceptance of Terms */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                1. Acceptance of Terms
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "you") and
                  Digital Growth Equity Ltd ("Company", "we", "us"), a company registered in England and Wales
                  (Company No. 13816862), with its registered office at 10 Harlow Gardens, Kingston Upon Thames,
                  England, KT1 3FF.
                </p>
                <p>
                  By accessing or using FloSynq, our AI-powered integration platform as a service (iPaaS), or any
                  related services provided through financeflo.ai, you agree to be bound by these Terms. If you do not
                  agree, you must not use our services.
                </p>
                <p>
                  If you are entering into these Terms on behalf of a company or other legal entity, you represent that
                  you have the authority to bind that entity to these Terms.
                </p>
              </div>
            </div>

            {/* 2. Service Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                2. Service Description
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  FloSynq is an AI-powered integration platform as a service (iPaaS) that enables businesses to connect,
                  synchronise, and automate data flows between disparate software systems. The service includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pre-built connectors for ERP, CRM, and business applications</li>
                  <li>AI-assisted data mapping and transformation</li>
                  <li>Workflow automation and orchestration</li>
                  <li>API management and governance tools</li>
                  <li>Real-time monitoring and error handling</li>
                </ul>
                <p>
                  We reserve the right to modify, suspend, or discontinue any part of the service at any time with
                  reasonable notice. We will endeavour to provide at least 30 days' notice for material changes.
                </p>
              </div>
            </div>

            {/* 3. Account Registration & Security */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                3. Account Registration &amp; Security
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  To use FloSynq, you must register for an account and provide accurate, complete information. You are
                  responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorised access or security breach</li>
                  <li>Ensuring all users within your organisation comply with these Terms</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate accounts that we reasonably believe have been compromised
                  or are being used in violation of these Terms.
                </p>
              </div>
            </div>

            {/* 4. Acceptable Use Policy */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                4. Acceptable Use Policy
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>You agree not to use FloSynq to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate any applicable law, regulation, or third-party rights</li>
                  <li>Transmit malicious code, viruses, or harmful data</li>
                  <li>Attempt to gain unauthorised access to our systems or other users' accounts</li>
                  <li>Reverse-engineer, decompile, or disassemble any part of the service</li>
                  <li>Use the service to process data in violation of data protection laws, including the UK GDPR, the Data Protection Act 2018, or the Protection of Personal Information Act 2013 (POPIA)</li>
                  <li>Exceed reasonable usage limits or engage in activities that degrade service performance for other users</li>
                </ul>
                <p>
                  We may suspend access without notice if we reasonably determine that your use poses a security risk or
                  violates this policy.
                </p>
              </div>
            </div>

            {/* 5. Intellectual Property */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                5. Intellectual Property
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  All intellectual property rights in FloSynq, including but not limited to software, algorithms, AI
                  models, documentation, trademarks, and design elements, are and remain the property of Digital Growth
                  Equity Ltd.
                </p>
                <p>
                  We grant you a limited, non-exclusive, non-transferable, revocable licence to use FloSynq for your
                  internal business purposes in accordance with these Terms. This licence does not include the right to
                  sublicense, resell, or distribute the service.
                </p>
                <p>
                  You retain all rights to your data. By using FloSynq, you grant us a limited licence to process your
                  data solely for the purpose of providing the service.
                </p>
              </div>
            </div>

            {/* 6. Data Processing & Integration */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                6. Data Processing &amp; Integration
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  As an iPaaS, FloSynq processes data that flows between your connected systems. You acknowledge and
                  agree that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You are the data controller for all personal data processed through FloSynq</li>
                  <li>We act as a data processor on your behalf and will process data only in accordance with your instructions and our Data Processing Agreement</li>
                  <li>Data in transit through FloSynq is encrypted using industry-standard TLS 1.2+ encryption</li>
                  <li>Integration data is processed in real-time and is not retained beyond the period necessary to complete the synchronisation, unless explicitly configured by you</li>
                  <li>You are responsible for ensuring that all data processed through FloSynq is collected and shared in compliance with applicable data protection laws</li>
                </ul>
                <p>
                  A separate Data Processing Agreement (DPA) is available upon request and forms part of these Terms
                  where personal data is processed.
                </p>
              </div>
            </div>

            {/* 7. Service Availability & SLA */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                7. Service Availability &amp; SLA
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  We strive to maintain high availability of FloSynq. While we target 99.9% uptime for our core
                  integration services, we do not guarantee uninterrupted access. The service may be temporarily
                  unavailable due to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Scheduled maintenance (with reasonable advance notice)</li>
                  <li>Emergency maintenance to address security vulnerabilities</li>
                  <li>Factors beyond our reasonable control, including third-party service outages</li>
                </ul>
                <p>
                  Specific SLA commitments, including uptime guarantees and remedies, may be set out in your individual
                  service agreement or subscription plan.
                </p>
              </div>
            </div>

            {/* 8. Limitation of Liability */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                8. Limitation of Liability
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>To the maximum extent permitted by applicable law:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Our total aggregate liability arising out of or in connection with these Terms shall not exceed the
                    total fees paid by you in the twelve (12) months preceding the claim
                  </li>
                  <li>
                    We shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                    including but not limited to loss of profits, data, business opportunities, or goodwill
                  </li>
                  <li>
                    We shall not be liable for any loss or damage arising from third-party integrations, APIs, or
                    services connected through FloSynq
                  </li>
                </ul>
                <p>
                  Nothing in these Terms excludes or limits liability for death or personal injury caused by negligence,
                  fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited by
                  English law.
                </p>
              </div>
            </div>

            {/* 9. Termination */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                9. Termination
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  Either party may terminate these Terms by providing 30 days' written notice to the other party.
                </p>
                <p>We may terminate or suspend your access immediately, without prior notice, if:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You breach any material provision of these Terms</li>
                  <li>You fail to pay any fees due within 14 days of the payment date</li>
                  <li>Your use of the service poses a security risk to us or other users</li>
                </ul>
                <p>
                  Upon termination, your right to use FloSynq ceases immediately. We will make your data available for
                  export for 30 days following termination, after which it may be deleted in accordance with our data
                  retention policy.
                </p>
              </div>
            </div>

            {/* 10. Governing Law */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                10. Governing Law
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  These Terms are governed by and construed in accordance with the laws of England and Wales. Any
                  disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction
                  of the courts of England and Wales.
                </p>
                <p>
                  For users based in the Republic of South Africa, we acknowledge that certain provisions of the
                  Protection of Personal Information Act 2013 (POPIA) and the Consumer Protection Act 2008 may apply in
                  addition to the provisions of these Terms. Where POPIA or South African consumer law provides greater
                  protections, those protections shall apply to the extent required by law.
                </p>
              </div>
            </div>

            {/* 11. Changes to Terms */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                11. Changes to Terms
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  We may update these Terms from time to time. We will notify you of material changes by posting the
                  updated Terms on our website and, where practicable, by email. The "Last updated" date at the top of
                  this page indicates when these Terms were last revised.
                </p>
                <p>
                  Your continued use of FloSynq after changes are posted constitutes acceptance of the revised Terms. If
                  you do not agree to the updated Terms, you must stop using the service.
                </p>
              </div>
            </div>

            {/* 12. Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                12. Contact Information
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>If you have any questions about these Terms, please contact us:</p>
                <div className="glass-panel p-6 mt-4 space-y-2" style={{ borderRadius: "var(--radius)" }}>
                  <p className="font-semibold text-foreground">Digital Growth Equity Ltd</p>
                  <p>Company No. 13816862</p>
                  <p>10 Harlow Gardens, Kingston Upon Thames, England, KT1 3FF</p>
                  <p>
                    Email:{" "}
                    <a href="mailto:legal@financeflo.ai" className="text-teal hover:underline">
                      legal@financeflo.ai
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
