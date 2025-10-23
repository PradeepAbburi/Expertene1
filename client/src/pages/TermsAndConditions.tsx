import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/auth">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </Button>
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
            Terms and Conditions
          </h1>
          <p className="text-muted-foreground">Last updated: October 19, 2025</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Expertene ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of our platform, website, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not use the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Expertene is operated and provided from India. These Terms are governed by the laws of India, and users accessing the Service from India or internationally agree to comply with all applicable local, state, and national laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 18 years of age to use the Service. By using the Service, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms. If you are accessing the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              To access certain features of the Service, you may be required to create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and accept all risks of unauthorized access</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Not create multiple accounts or impersonate others</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You are responsible for all activities that occur under your account. We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. User Content and Conduct</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              You retain ownership of any content you post, upload, or share on the Service ("User Content"). By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and distribute such content in connection with the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-2">You agree not to post User Content that:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
              <li>Infringes any patent, trademark, trade secret, copyright, or other intellectual property rights</li>
              <li>Contains viruses, malware, or any harmful code</li>
              <li>Impersonates any person or entity or misrepresents your affiliation with a person or entity</li>
              <li>Violates the privacy rights of others or discloses personal information without consent</li>
              <li>Promotes discrimination, hatred, or violence against individuals or groups</li>
              <li>Contains false, misleading, or fraudulent information</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We reserve the right to remove any User Content that violates these Terms or is otherwise objectionable, without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. Intellectual Property Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, features, and functionality on the Service (including but not limited to text, graphics, logos, icons, images, audio clips, video clips, data compilations, and software) are the exclusive property of Expertene or its licensors and are protected by Indian and international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">6. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the Service for any unlawful purpose or in violation of these Terms</li>
              <li>Attempt to gain unauthorized access to any portion of the Service or any other systems or networks</li>
              <li>Interfere with or disrupt the Service or servers or networks connected to the Service</li>
              <li>Use any robot, spider, scraper, or other automated means to access the Service</li>
              <li>Engage in any activity that could damage, disable, overburden, or impair the Service</li>
              <li>Collect or harvest any personal information from other users without consent</li>
              <li>Use the Service to transmit spam, chain letters, or unsolicited communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">7. Payment and Subscriptions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Certain features of the Service may require payment. All fees are quoted in Indian Rupees (INR) unless otherwise stated. You agree to pay all applicable fees and charges associated with your use of paid features. Payment processing is handled securely through third-party payment processors. We do not store your payment card information.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Subscription fees are billed in advance on a recurring basis (monthly, annually, etc.). Subscriptions automatically renew unless cancelled prior to the renewal date. Refunds are provided in accordance with our Refund Policy, subject to applicable Indian consumer protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">8. Privacy and Data Protection</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your privacy is important to us. Our collection, use, and disclosure of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We comply with applicable Indian data protection laws, including the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">9. Third-Party Links and Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service may contain links to third-party websites, applications, or services that are not owned or controlled by Expertene. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that we shall not be responsible or liable for any damage or loss caused by your use of any third-party content or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">10. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-relaxed">
              THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We do not warrant that the Service will be uninterrupted, secure, or error-free, or that defects will be corrected. We do not warrant the accuracy, completeness, or reliability of any content or information on the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">11. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              TO THE FULLEST EXTENT PERMITTED BY LAW, EXPERTENE AND ITS DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
              <li>Your access to or use of or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Any content obtained from the Service</li>
              <li>Unauthorized access, use, or alteration of your content</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT PAID BY YOU, IF ANY, FOR ACCESS TO THE SERVICE DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR INR 5,000, WHICHEVER IS GREATER.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">12. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify, defend, and hold harmless Expertene and its directors, officers, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of another party</li>
              <li>Your User Content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">13. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including but not limited to breach of these Terms. Upon termination, your right to use the Service will immediately cease.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              You may terminate your account at any time by contacting us or using account deletion features within the Service. Upon termination, we may delete your User Content, subject to our data retention policies and legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">14. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts located in [Your City/State], India.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We encourage users to contact us first to resolve disputes amicably. If a dispute cannot be resolved informally, you agree to attempt mediation or arbitration before pursuing litigation, in accordance with Indian arbitration laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">15. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify or replace these Terms at any time at our sole discretion. If we make material changes, we will notify you by posting the updated Terms on the Service and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We encourage you to review these Terms periodically to stay informed of any updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">16. Severability</h2>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it enforceable, or if such modification is not possible, the provision shall be severed from these Terms. The remaining provisions shall continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">17. Entire Agreement</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms, together with our Privacy Policy and any other policies or guidelines posted on the Service, constitute the entire agreement between you and Expertene regarding your use of the Service and supersede all prior agreements and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">18. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions, concerns, or complaints about these Terms or the Service, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-muted rounded-lg">
              <p className="font-medium">Expertene</p>
              <p className="text-muted-foreground">Email: support@expertene.com</p>
              <p className="text-muted-foreground">Address: [Your Company Address, City, State, India]</p>
            </div>
          </section>

          <section className="border-t pt-6 mt-8">
            <p className="text-sm text-muted-foreground italic">
              By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with these Terms, please discontinue use of the Service immediately.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/auth">
              Back to Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
