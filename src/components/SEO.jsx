import { useEffect } from "react";

const SITE_NAME = "Corporate Eye Clinic";
const SITE_DESC =
  "Affordable, computerised eye care for individuals, families, schools and organisations across Ibadan, Oyo State. Book an appointment online today.";

/**
 * SEO — updates document title and meta description on each page.
 * No library needed. Works with React 18 and nested routes.
 */
export default function SEO({ title, description }) {
  const fullTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — Ibadan's trusted eye care`;

  const metaDesc = description || SITE_DESC;

  useEffect(() => {
    // Update page title
    document.title = fullTitle;

    // Update meta description
    let descTag = document.querySelector('meta[name="description"]');
    if (descTag) descTag.setAttribute("content", metaDesc);

    // Update Open Graph title and description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", metaDesc);

    // Update Twitter title and description
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute("content", fullTitle);

    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute("content", metaDesc);

    // Reset to defaults when component unmounts (navigating away)
    return () => {
      document.title = `${SITE_NAME} — Ibadan's trusted eye care`;
    };
  }, [fullTitle, metaDesc]);

  // Renders nothing — side effects only
  return null;
}
