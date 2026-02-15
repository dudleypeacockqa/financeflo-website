import { useEffect } from "react";
import PageHero from "@/components/sections/PageHero";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy | FinanceFlo.ai";
  }, []);

  return (
    <div className="min-h-screen pt-24">
      <PageHero
        tagline="Legal"
        title="Privacy"
        titleAccent="Policy"
        description="This policy explains how Digital Growth Equity Ltd collects, uses, and protects your personal data when you use FloSynq and our related services."
      />

      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl space-y-12">
            <p className="text-sm text-muted-foreground">Last updated: 15 February 2026</p>

            {/* 1. Introduction & Data Controller */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                1. Introduction &amp; Data Controller
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  Digital Growth Equity Ltd ("Company", "we", "us"), registered in England and Wales (Company No.
                  13816862) with its registered office at 10 Harlow Gardens, Kingston Upon Thames, England, KT1 3FF, is
                  the data controller for personal data collected through our website (financeflo.ai) and our FloSynq
                  iPaaS platform.
                </p>
                <p>
                  We are committed to protecting your privacy and processing your personal data in compliance with the UK
                  General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, and, where applicable, the
                  South African Protection of Personal Information Act 2013 (POPIA).
                </p>
                <p>
                  Where we process data on your behalf through FloSynq integrations, we act as a data processor under
                  your instructions, as detailed in Section 4.
                </p>
              </div>
            </div>

            {/* 2. Information We Collect */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                2. Information We Collect
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We collect the following categories of personal data:</p>
                <h3 className="text-lg font-semibold text-foreground mt-4">Account Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, and contact details</li>
                  <li>Company name, job title, and business information</li>
                  <li>Account credentials (passwords are stored in hashed form only)</li>
                  <li>Billing and payment information</li>
                </ul>
                <h3 className="text-lg font-semibold text-foreground mt-4">Integration Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>API credentials and connection configurations for your integrated systems</li>
                  <li>Data that passes through FloSynq during synchronisation (processed in transit; see Section 4)</li>
                  <li>Integration logs, error reports, and sync metadata</li>
                </ul>
                <h3 className="text-lg font-semibold text-foreground mt-4">Usage Analytics</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pages visited, features used, and interaction patterns</li>
                  <li>Device information, browser type, and IP address</li>
                  <li>Referral source and session duration</li>
                </ul>
              </div>
            </div>

            {/* 3. How We Use Your Information */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                3. How We Use Your Information
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We process your personal data under the following legal bases (UK GDPR Article 6):</p>
                <h3 className="text-lg font-semibold text-foreground mt-4">Performance of Contract (Art. 6(1)(b))</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Providing and maintaining FloSynq services</li>
                  <li>Processing integrations and data synchronisations</li>
                  <li>Account management and customer support</li>
                  <li>Billing and payment processing</li>
                </ul>
                <h3 className="text-lg font-semibold text-foreground mt-4">Legitimate Interests (Art. 6(1)(f))</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Improving and developing our services</li>
                  <li>Analysing usage patterns to enhance user experience</li>
                  <li>Detecting and preventing fraud or security threats</li>
                  <li>Business communications and relationship management</li>
                </ul>
                <h3 className="text-lg font-semibold text-foreground mt-4">Consent (Art. 6(1)(a))</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Marketing communications (you can opt out at any time)</li>
                  <li>Non-essential cookies and analytics tracking</li>
                </ul>
                <h3 className="text-lg font-semibold text-foreground mt-4">Legal Obligation (Art. 6(1)(c))</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Compliance with tax, accounting, and regulatory requirements</li>
                  <li>Responding to lawful requests from authorities</li>
                </ul>
              </div>
            </div>

            {/* 4. Data Processing Through FloSynq */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                4. Data Processing Through FloSynq
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  FloSynq operates as an integration platform. When you configure integrations between your business
                  systems, data flows through our platform. It is important to understand:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">Transit processing:</strong> Data passing through FloSynq is
                    processed in real-time for transformation and routing. It is not stored beyond the time necessary to
                    complete the synchronisation unless you configure data caching or logging
                  </li>
                  <li>
                    <strong className="text-foreground">Encryption:</strong> All data in transit is encrypted using
                    TLS 1.2+ and data at rest (where applicable) is encrypted using AES-256
                  </li>
                  <li>
                    <strong className="text-foreground">Data processor role:</strong> For integration data, we act as a
                    data processor under your instructions. A Data Processing Agreement (DPA) is available upon request
                  </li>
                  <li>
                    <strong className="text-foreground">No secondary use:</strong> We do not use your integration data
                    for any purpose other than providing the FloSynq service, including AI model training
                  </li>
                  <li>
                    <strong className="text-foreground">Error logs:</strong> Minimal metadata may be retained in error
                    logs for debugging purposes, with personal data redacted where technically feasible
                  </li>
                </ul>
              </div>
            </div>

            {/* 5. Data Sharing & Third Parties */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                5. Data Sharing &amp; Third Parties
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We may share your personal data with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">Service providers:</strong> Hosting (Render), cloud
                    infrastructure (AWS), payment processing, and email services — all bound by data processing
                    agreements
                  </li>
                  <li>
                    <strong className="text-foreground">Connected systems:</strong> Data is transmitted to and from
                    third-party systems as configured by you through FloSynq integrations
                  </li>
                  <li>
                    <strong className="text-foreground">Professional advisers:</strong> Lawyers, auditors, and
                    accountants where necessary for our legitimate business interests
                  </li>
                  <li>
                    <strong className="text-foreground">Legal requirements:</strong> Where disclosure is required by law,
                    regulation, or court order
                  </li>
                </ul>
                <p>
                  We do not sell your personal data. We do not share your data with third parties for their own marketing
                  purposes.
                </p>
              </div>
            </div>

            {/* 6. International Data Transfers */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                6. International Data Transfers
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  Our services are provided from infrastructure located in the European Union (Frankfurt, Germany). Your
                  data may be transferred internationally in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">UK to EU:</strong> Transfers are covered by the UK adequacy
                    decision for the EU
                  </li>
                  <li>
                    <strong className="text-foreground">UK/EU to South Africa:</strong> Where we provide services to
                    South African clients, transfers are protected by Standard Contractual Clauses (SCCs) approved by the
                    UK ICO, and comply with POPIA cross-border transfer requirements under Section 72
                  </li>
                  <li>
                    <strong className="text-foreground">Sub-processors:</strong> Where our sub-processors are located
                    outside the UK/EU, appropriate safeguards (SCCs or adequacy decisions) are in place
                  </li>
                </ul>
              </div>
            </div>

            {/* 7. Data Retention */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                7. Data Retention
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We retain personal data only for as long as necessary:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">Account data:</strong> Retained for the duration of your account
                    and for 12 months following closure, unless longer retention is required by law
                  </li>
                  <li>
                    <strong className="text-foreground">Integration data:</strong> Processed in transit only; not
                    retained unless you configure logging or caching
                  </li>
                  <li>
                    <strong className="text-foreground">Usage analytics:</strong> Retained in anonymised/aggregated form
                    for up to 24 months
                  </li>
                  <li>
                    <strong className="text-foreground">Financial records:</strong> Retained for 7 years as required by
                    UK tax and accounting regulations
                  </li>
                  <li>
                    <strong className="text-foreground">Marketing consent records:</strong> Retained for the duration of
                    the consent plus 12 months
                  </li>
                </ul>
              </div>
            </div>

            {/* 8. Your Rights */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                8. Your Rights
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <h3 className="text-lg font-semibold text-foreground mt-4">Under UK GDPR</h3>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-foreground">Access</strong> — request a copy of your personal data</li>
                  <li><strong className="text-foreground">Rectification</strong> — correct inaccurate or incomplete data</li>
                  <li><strong className="text-foreground">Erasure</strong> — request deletion of your data ("right to be forgotten")</li>
                  <li><strong className="text-foreground">Restriction</strong> — request limited processing of your data</li>
                  <li><strong className="text-foreground">Portability</strong> — receive your data in a structured, machine-readable format</li>
                  <li><strong className="text-foreground">Object</strong> — object to processing based on legitimate interests or direct marketing</li>
                  <li><strong className="text-foreground">Withdraw consent</strong> — where processing is based on consent, withdraw at any time</li>
                </ul>
                <h3 className="text-lg font-semibold text-foreground mt-4">Under POPIA (South African users)</h3>
                <p>In addition to the above, South African data subjects have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be notified that personal information is being collected</li>
                  <li>Request correction or deletion of personal information</li>
                  <li>Object to the processing of personal information for direct marketing</li>
                  <li>Lodge a complaint with the Information Regulator (South Africa)</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us at{" "}
                  <a href="mailto:privacy@financeflo.ai" className="text-teal hover:underline">
                    privacy@financeflo.ai
                  </a>
                  . We will respond within 30 days (or one month under UK GDPR).
                </p>
              </div>
            </div>

            {/* 9. Cookies & Tracking */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                9. Cookies &amp; Tracking
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>We use the following types of cookies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">Strictly necessary:</strong> Required for the service to
                    function (e.g., authentication tokens, session management). These cannot be disabled.
                  </li>
                  <li>
                    <strong className="text-foreground">Analytics:</strong> Help us understand how visitors interact with
                    our website. These are only set with your consent.
                  </li>
                  <li>
                    <strong className="text-foreground">Functional:</strong> Remember your preferences (e.g., language,
                    region). Set with your consent.
                  </li>
                </ul>
                <p>
                  You can manage cookie preferences through your browser settings. Disabling non-essential cookies will
                  not affect the core functionality of FloSynq.
                </p>
              </div>
            </div>

            {/* 10. Security Measures */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                10. Security Measures
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  We implement appropriate technical and organisational measures to protect your personal data,
                  including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit (TLS 1.2+) and at rest (AES-256)</li>
                  <li>Regular security assessments and vulnerability scanning</li>
                  <li>Access controls with role-based permissions and multi-factor authentication</li>
                  <li>Secure development practices and code review processes</li>
                  <li>Incident response procedures with breach notification within 72 hours as required by UK GDPR</li>
                  <li>Regular staff training on data protection and security best practices</li>
                </ul>
              </div>
            </div>

            {/* 11. Children's Privacy */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                11. Children's Privacy
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  FloSynq is a business-to-business service and is not intended for use by individuals under the age of
                  18. We do not knowingly collect personal data from children. If we become aware that we have collected
                  personal data from a child, we will take steps to delete it promptly.
                </p>
              </div>
            </div>

            {/* 12. Changes to This Policy */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                12. Changes to This Policy
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                  requirements. We will notify you of material changes by posting the updated policy on our website and,
                  where practicable, by email.
                </p>
                <p>
                  The "Last updated" date at the top of this page indicates when this policy was last revised. We
                  encourage you to review this policy periodically.
                </p>
              </div>
            </div>

            {/* 13. Contact & Data Protection Officer */}
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
                13. Contact &amp; Data Protection
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  For any questions about this Privacy Policy or to exercise your data protection rights, please contact
                  us:
                </p>
                <div className="glass-panel p-6 mt-4 space-y-2" style={{ borderRadius: "var(--radius)" }}>
                  <p className="font-semibold text-foreground">Digital Growth Equity Ltd</p>
                  <p>Company No. 13816862</p>
                  <p>10 Harlow Gardens, Kingston Upon Thames, England, KT1 3FF</p>
                  <p>
                    Email:{" "}
                    <a href="mailto:privacy@financeflo.ai" className="text-teal hover:underline">
                      privacy@financeflo.ai
                    </a>
                  </p>
                </div>
                <h3 className="text-lg font-semibold text-foreground mt-6">Supervisory Authorities</h3>
                <p>
                  You have the right to lodge a complaint with a supervisory authority if you believe your data
                  protection rights have been violated:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">UK:</strong> Information Commissioner's Office (ICO) —{" "}
                    <a href="https://ico.org.uk" className="text-teal hover:underline" target="_blank" rel="noopener noreferrer">
                      ico.org.uk
                    </a>
                  </li>
                  <li>
                    <strong className="text-foreground">South Africa:</strong> Information Regulator —{" "}
                    <a href="https://inforegulator.org.za" className="text-teal hover:underline" target="_blank" rel="noopener noreferrer">
                      inforegulator.org.za
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
