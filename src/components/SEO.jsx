import { useEffect } from "react";

const SITE_NAME = "Corporate Eye Clinic";
const SITE_URL = "https://www.corporateeyeclinic.com";
const SITE_DESC =
  "Affordable, computerised eye care for individuals, families, schools and organisations across Ibadan, Oyo State. Book an appointment online today.";
const GA_MEASUREMENT_ID = "G-NHRKEQYEWY";

let gaLoaded = false;

/**
 * Loads the gtag.js library once, the first time any page mounts SEO.
 * send_page_view is off in the initial config — SEO fires every page_view
 * itself (including the first one) so route changes are tracked correctly
 * in this client-side-routed app, where there's no real page reload for
 * gtag's default auto-tracking to hook into.
 */
function loadGoogleAnalytics() {
  if (gaLoaded || typeof window === "undefined") return;
  gaLoaded = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
}

/**
 * SEO — updates document title, meta description, canonical link, and
 * og:url on each page, and fires a GA4 page_view for it. No library
 * needed. Works with React 18 and nested routes.
 *
 * `path` should be the route's path starting with "/", e.g. "/services".
 * Omit it (or pass "/") for the homepage.
 */
export default function SEO({ title, description, path = "/" }) {
  const fullTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — Ibadan's trusted eye care`;

  const metaDesc = description || SITE_DESC;
  const canonicalUrl = `${SITE_URL}${path === "/" ? "/" : path}`;

  useEffect(() => {
    // Update page title
    document.title = fullTitle;

    // Update meta description
    let descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", metaDesc);

    // Update canonical link — each route must point at itself, not the
    // homepage, or Google treats every page as a duplicate of "/".
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) canonicalTag.setAttribute("href", canonicalUrl);

    // Update Open Graph title, description, and url
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", metaDesc);

    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);

    // Update Twitter title and description
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", fullTitle);

    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", metaDesc);

    // Google Analytics — load once, then fire a page_view for every route
    loadGoogleAnalytics();
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: path,
        page_title: fullTitle,
        page_location: canonicalUrl,
      });
    }

    // Reset to defaults when component unmounts (navigating away)
    return () => {
      document.title = `${SITE_NAME} — Ibadan's trusted eye care`;
      if (canonicalTag) canonicalTag.setAttribute("href", `${SITE_URL}/`);
    };
  }, [fullTitle, metaDesc, canonicalUrl, path]);

  // Renders nothing — side effects only
  return null;
}
