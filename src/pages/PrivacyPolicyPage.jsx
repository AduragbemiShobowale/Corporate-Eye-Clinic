import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import "./LegalPage.css";

export default function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <SEO
        path="/privacy-policy"
        title="Privacy Policy"
        description="How Corporate Eye Clinic collects, uses, and protects your personal and health information."
      />
      <h1>Privacy Policy</h1>
      <p className="legal-page__updated">Last updated: September 2026</p>

      <p>
        Corporate Eye Clinic ("we," "us," "our") operates this website and the
        appointment booking, prescription ordering, and shop services on it.
        This policy explains what personal information we collect, how we use
        it, and the choices you have — in plain language.
      </p>

      <h2>Information we collect</h2>
      <p>When you use this site, we may collect:</p>
      <ul>
        <li>
          <strong>Contact details</strong> you give us when booking an
          appointment or placing an order — your name, phone number, and email
          address.
        </li>
        <li>
          <strong>Health-related information</strong> you choose to share when
          booking an eye exam, submitting a prescription, or describing your
          reason for visiting — for example, an existing prescription, symptoms,
          or which branch and service you need.
        </li>
        <li>
          <strong>Order and payment information</strong> for shop purchases,
          including items ordered and payment method (bank transfer details are
          handled manually by our staff; online payments, once enabled, are
          processed by a third-party payment provider — we do not store your
          card details ourselves).
        </li>
        <li>
          <strong>Technical information</strong> such as browser type and
          general usage data, collected automatically to help us keep the site
          working properly.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To schedule, confirm, and manage your appointments</li>
        <li>To process and fulfil shop orders and prescription requests</li>
        <li>
          To contact you about your appointment or order — by phone, SMS,
          WhatsApp, or email
        </li>
        <li>To maintain accurate patient records for your ongoing care</li>
        <li>To improve our services and this website</li>
      </ul>
      <p>
        We do not sell your personal information to third parties. We do not use
        your health information for marketing without your separate consent.
      </p>

      <h2>Who we share information with</h2>
      <p>
        We share information only where necessary to run the clinic and this
        website:
      </p>
      <ul>
        <li>
          Our clinical and front-desk staff, for the purpose of providing your
          care
        </li>
        <li>
          Service providers who help us run this site and our operations —
          including our website hosting provider, our database provider, image
          hosting, email delivery, and (once live) our online payment processor.
          These providers only receive what they need to perform their function
          and are not permitted to use your data for their own purposes.
        </li>
        <li>
          Legal or regulatory authorities, where we are required to by Nigerian
          law
        </li>
      </ul>

      <h2>Your rights</h2>
      <p>
        Under the Nigeria Data Protection Act, you have the right to ask what
        personal information we hold about you, request that inaccurate
        information be corrected, and request deletion of your information where
        we are not legally required to keep it (for example, some medical
        records must be retained for a minimum period under healthcare
        regulations). To make a request, contact us using the details below.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep appointment and medical records for as long as needed to provide
        your ongoing care and as required by applicable healthcare
        record-keeping regulations. Shop order records are kept for accounting
        purposes.
      </p>

      <h2>Cookies</h2>
      <p>
        This site uses only the technical cookies/local storage needed to keep
        it working correctly (for example, keeping items in your shop cart). We
        do not currently use advertising or cross-site tracking cookies.
      </p>

      <h2>Contact us</h2>
      <p>
        If you have questions about this policy or how your information is
        handled, contact us at{" "}
        <a href="mailto:corporateeyeclinic@gmail.com">
          corporateeyeclinic@gmail.com
        </a>{" "}
        or <a href="tel:+2348033372738">+234 803 337 2738</a>.
      </p>

      <p>
        <Link to="/terms">Read our Terms &amp; Conditions →</Link>
      </p>

      <div className="legal-page__note">
        This policy is provided as a good-faith description of our current
        practices and is not a substitute for independent legal advice.
      </div>
    </div>
  );
}
