import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import "./LegalPage.css";

export default function TermsPage() {
  return (
    <div className="legal-page">
      <SEO
        path="/terms"
        title="Terms & Conditions"
        description="The terms that govern your use of the Corporate Eye Clinic website, appointment bookings, and shop."
      />
      <h1>Terms &amp; Conditions</h1>
      <p className="legal-page__updated">Last updated: September 2026</p>

      <p>
        These terms govern your use of the Corporate Eye Clinic website,
        appointment booking system, and eyewear shop. By using this site, you
        agree to them. If you don't agree, please don't use the site — you're
        always welcome to call or visit a branch directly instead.
      </p>

      <h2>Appointments</h2>
      <p>
        Booking an appointment through this site requests a slot with us — it
        isn't confirmed until you receive confirmation from our staff. We ask
        that you arrive on time or contact us if you need to reschedule.
        Repeated no-shows may affect our ability to hold future appointments for
        you.
      </p>

      <h2>Not a medical diagnosis</h2>
      <p>
        Nothing on this website — including the eye condition descriptions,
        service pages, or the vision simulator — is a medical diagnosis or a
        substitute for an in-person examination. If you have an eye concern,
        please book an appointment or seek care rather than relying on this site
        alone.
      </p>

      <h2>Shop orders</h2>
      <ul>
        <li>
          Product availability, pricing, and prescription accuracy are confirmed
          by our staff before an order is finalised.
        </li>
        <li>
          Orders paid by bank transfer are verified manually by our team; please
          allow time for this before your order is marked confirmed.
        </li>
        <li>
          Prescription eyewear and contact lens orders require a valid, accurate
          prescription — we are not responsible for issues arising from an
          incorrect prescription supplied by the customer.
        </li>
        <li>
          Returns, exchanges, and order issues are handled case-by-case —
          contact us directly and we'll sort it out.
        </li>
      </ul>

      <h2>Website use</h2>
      <p>
        You agree to use this site lawfully and not to attempt to disrupt it,
        misuse the booking or ordering systems, or submit false information.
        Content on this site — text, images, and design — is owned by Corporate
        Eye Clinic or used with permission, and shouldn't be copied without our
        consent.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        We aim to keep this site accurate and available, but we don't guarantee
        it will be error-free or uninterrupted. To the extent permitted by
        Nigerian law, Corporate Eye Clinic isn't liable for indirect losses
        arising from your use of this website; this doesn't limit our
        responsibility for the clinical care we provide in person, which is
        governed by standard medical practice and applicable healthcare
        regulation.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time as the site and our services
        evolve. Continued use of the site after changes means you accept the
        updated terms.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the Federal Republic of Nigeria.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about these terms? Reach us at{" "}
        <a href="mailto:corporateeyeclinic@gmail.com">
          corporateeyeclinic@gmail.com
        </a>{" "}
        or <a href="tel:+2348033372738">+234 803 337 2738</a>.
      </p>

      <p>
        <Link to="/privacy-policy">Read our Privacy Policy →</Link>
      </p>

      <div className="legal-page__note">
        These terms are provided as a good-faith summary of how we operate and
        are not a substitute for independent legal advice.
      </div>
    </div>
  );
}
