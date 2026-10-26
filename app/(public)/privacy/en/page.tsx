import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";
import PolicySection from "../PolicySection";

// English version of /privacy — the App Store Connect privacy URL for the English locale.
// Keep in sync with the Arabic page and App Store "App Privacy".
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Hala (ChatHala) — what we collect, how we use and protect it, and when we delete it",
};

export default function PrivacyPageEn() {
  return (
    <div dir="ltr" lang="en" className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-4">
          <Shield size={32} className="text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4">Privacy Policy</h1>
        <p className="text-text-muted">Last updated: October 26, 2026</p>
        <Link href="/privacy" className="text-accent-pink hover:underline text-sm" lang="ar">
          النسخة العربية
        </Link>
      </div>

      <div className="prose-custom space-y-8">
        <PolicySection ltr title="Introduction">
          <p>
            At Hala (ChatHala) we respect your privacy and are committed to protecting your data. This policy
            explains what information we collect, how we use and protect it, and when we delete it.
          </p>
        </PolicySection>

        <PolicySection ltr title="1. Information We Collect">
          <p><strong>Information you provide:</strong></p>
          <ul>
            <li><strong>Account data:</strong> email and password, or your Apple or Google account if you sign in with them.</li>
            <li><strong>Date of birth:</strong> to verify you are 18 or older.</li>
            <li><strong>Profile:</strong> display name, photos, gender, country, bio, and interests.</li>
            <li><strong>Content:</strong> text and voice messages, photos and videos in chats, and the stories you post.</li>
            <li>
              <strong>Location:</strong> with your permission, to show people near you and to share your location
              in a chat (once, or live for a period you choose while you use the app).
            </li>
          </ul>
          <p><strong>Information collected automatically:</strong></p>
          <ul>
            <li><strong>Device and usage:</strong> device type, operating system, app version, IP address, sign-in times, and in-app interactions such as likes and profile visits.</li>
            <li><strong>Device identifiers:</strong> an app-specific identifier we use to protect the platform and enforce bans on violating accounts.</li>
            <li><strong>Crash and performance reports:</strong> to fix technical issues.</li>
          </ul>
          <p>
            <strong>Device permissions:</strong> we access the camera, microphone, photo library, or location only
            with your permission, and you can revoke it at any time in your device settings.
          </p>
        </PolicySection>

        <PolicySection ltr title="2. How We Use Your Information">
          <ul>
            <li>To provide messaging, dating, and stories features</li>
            <li>To show people near you and suggest relevant profiles</li>
            <li>To verify users are 18 or older</li>
            <li>To send notifications about your account and chats</li>
            <li>To manage your Hala+ subscription</li>
            <li>To keep users safe, prevent fraud and abuse, and review reports</li>
            <li>To improve app performance and fix crashes</li>
          </ul>
        </PolicySection>

        <PolicySection ltr title="3. What Other Users Can See">
          <ul>
            <li>Your profile, photos, and stories, according to the privacy settings you choose.</li>
            <li>Your online status, last seen, and whether you are in a chat right now — you can hide these in privacy settings.</li>
            <li>When you post a story, you see how many people viewed it and took screenshots; Hala+ subscribers see who viewed their stories.</li>
          </ul>
        </PolicySection>

        <PolicySection ltr title="4. Messages and Chats">
          <p>
            We respect the privacy of your chats. We do not sell your messages or share them with anyone for
            marketing. Messages are stored on our servers so you can access them from your devices.
          </p>
          <p>
            <strong>Automated screening:</strong> to protect users, text messages and published text are
            automatically screened for promotion of outside accounts or services and for banned words. Violating
            content may be hidden from the recipient and recorded as a violation on the account.
          </p>
          <p><strong>Human review:</strong> our team views chats only:</p>
          <ul>
            <li>When a report is submitted — the reported messages or media are reviewed</li>
            <li>When required by a court order or an official request from a competent authority</li>
          </ul>
        </PolicySection>

        <PolicySection ltr title="5. Disappearing Media and Stories">
          <ul>
            <li>
              <strong>Disappearing photos and videos</strong> disappear for the recipient after viewing or 24 hours
              after sending, and <strong>stories</strong> disappear 24 hours after posting.
            </li>
            <li>
              After they end, we keep a protected copy, accessible only to our moderation team, for{" "}
              <strong>30 days</strong> to review reports. It is then permanently and automatically deleted — except
              content tied to a report under review, which is deleted once the report is closed.
            </li>
            <li>
              We try to block screenshots of disappearing media and notify story owners of screenshots, but photos
              taken with another device cannot be prevented — share responsibly.
            </li>
          </ul>
        </PolicySection>

        <PolicySection ltr title="6. Sensitive Content">
          <p>
            If you turn on Sensitive Content Warning in iOS settings, the app blurs sensitive photos and videos you
            receive. This check runs <strong>only on your device</strong> using Apple technology; no content is sent
            to us or anyone else.
          </p>
        </PolicySection>

        <PolicySection ltr title="7. Third-Party Services">
          <p>We use the following services, each with its own privacy policy:</p>
          <ul>
            <li><strong>Google Firebase:</strong> push notifications and crash reports</li>
            <li><strong>Google AdMob:</strong> displaying ads</li>
            <li><strong>Apple and Google:</strong> sign in with their accounts (if you choose)</li>
            <li><strong>Apple App Store:</strong> subscription and payment processing — we never see your card details</li>
            <li><strong>Cloudflare:</strong> server protection and faster content delivery</li>
          </ul>
        </PolicySection>

        <PolicySection ltr title="8. Advertising">
          <p>
            The app shows ads through Google AdMob; Hala+ subscribers see no ads. We use your advertising identifier
            for personalized ads only with your consent through the iOS &quot;Allow Tracking&quot; prompt, and you can
            change this at any time in your device settings.
          </p>
        </PolicySection>

        <PolicySection ltr title="9. Data Security">
          <p>
            We take appropriate security measures to protect your information, including encrypting the connection
            between the app and our servers (SSL/TLS) and restricting archived media to our moderation team only.
            However, no transmission over the internet can be guaranteed 100% secure.
          </p>
        </PolicySection>

        <PolicySection ltr title="10. Data Retention">
          <ul>
            <li><strong>Your account data:</strong> for as long as your account exists.</li>
            <li><strong>Disappearing media and stories after they end:</strong> 30 days, as described above.</li>
            <li>
              <strong>When you delete your account:</strong> your profile data is deleted immediately and your
              messages are disassociated from your identity. We keep security and anti-fraud records (such as the
              device identifier of violating accounts, and reports) for up to 90 days, financial records as required
              by law, and backups are erased within 30 days.
            </li>
          </ul>
        </PolicySection>

        <PolicySection ltr title="11. Your Rights">
          <ul>
            <li>Access your personal data and request a copy of it</li>
            <li>Edit or correct your data in the app or by contacting us</li>
            <li>Control your visibility in privacy settings</li>
            <li>Revoke device permissions or tracking consent at any time</li>
            <li>
              Delete your account and data at any time: in the app under{" "}
              <strong>My Profile → Settings → Delete Account</strong>, or by contacting us
            </li>
          </ul>
        </PolicySection>

        <PolicySection ltr title="12. Children's Privacy">
          <p>
            Hala is not intended for anyone under <strong>18</strong>. We do not knowingly collect information from
            minors. If we learn that someone under 18 has provided us with information, we delete it and close the
            account immediately.
          </p>
        </PolicySection>

        <PolicySection ltr title="13. Changes to This Policy">
          <p>We may update this policy from time to time and will notify you of material changes in the app.</p>
        </PolicySection>

        <PolicySection ltr title="14. Contact Us">
          <p>
            For any question about this policy or to exercise your rights, email{" "}
            <a href="mailto:kaebs19@gmail.com" className="text-accent-pink hover:underline">
              kaebs19@gmail.com
            </a>{" "}
            or use our{" "}
            <Link href="/contact" className="text-accent-pink hover:underline">
              contact page
            </Link>
            .
          </p>
        </PolicySection>
      </div>
    </div>
  );
}
