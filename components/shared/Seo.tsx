import { useEffect } from "react";
import type { CaseStudyRecord } from "../CaseStudyDetail/caseStudies";

const SITE_URL = "https://stridemedia.co";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value));
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

function organizationGraph() {
  return [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Stride Media",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/favicon.svg`,
      email: "hello@stridemedia.co",
      telephone: "+971544278816",
      sameAs: [
        "https://www.instagram.com/stride.media_/",
        "https://www.linkedin.com/company/stridemediauae/",
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#business`,
      name: "Stride Media",
      url: `${SITE_URL}/`,
      image: DEFAULT_IMAGE,
      email: "hello@stridemedia.co",
      telephone: "+971544278816",
      address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
      areaServed: { "@type": "Place", name: "Dubai, United Arab Emirates" },
      parentOrganization: { "@id": `${SITE_URL}/#organization` },
      serviceType: ["Short-form video production", "Content strategy", "Personal brand positioning", "Social media content"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Stride Media",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en",
    },
  ];
}

export default function Seo({ study, videoLibrary = false }: { study?: CaseStudyRecord; videoLibrary?: boolean }) {
  useEffect(() => {
    const path = study ? `/case-studies/${study.slug}` : videoLibrary ? "/videos" : "/";
    const canonical = `${SITE_URL}${path}`;
    const title = study
      ? `${study.client} Case Study | Stride Media Dubai`
      : videoLibrary
        ? "Client Video Results | Stride Media Dubai"
        : "Stride Media Dubai | Short-Form Video & Personal Brand Agency";
    const description = study
      ? study.summary
      : videoLibrary
        ? "Watch verified short-form video results produced by Stride Media for property advisors and entrepreneurs in Dubai."
        : "Stride Media is a Dubai short-form video and personal brand agency delivering strategy, scripting, production and consistent publishing.";
    const image = study?.portrait ? `${SITE_URL}${study.portrait}` : DEFAULT_IMAGE;

    document.title = title;
    upsertCanonical(canonical);
    upsertMeta('meta[name="description"]', { name: "description", content: description });
    upsertMeta('meta[name="robots"]', { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: study ? "article" : "website" });
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
    upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: study ? `${study.client} — Stride Media client case study` : "Stride Media — Strategy. Content. Recognition." });
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "Stride Media" });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });

    const graph: Record<string, unknown>[] = organizationGraph();
    if (study) {
      graph.push({
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Case Studies", item: `${SITE_URL}/#case-study` },
          { "@type": "ListItem", position: 3, name: study.client, item: canonical },
        ],
      });
    } else if (!videoLibrary) {
      graph.push(
        {
          "@type": "VideoObject",
          name: "Imtaz Ahmed — first-week client results",
          description: "Imtaz Ahmed discusses deals and qualified leads generated during the first week of working with Stride Media.",
          thumbnailUrl: `${SITE_URL}/testimonials/client-story-03.jpg`,
          contentUrl: `${SITE_URL}/testimonials/client-story-03.mp4`,
          uploadDate: "2026-10-18",
        },
        {
          "@type": "VideoObject",
          name: "Client results — leads through social media",
          description: "A Stride Media client story about generating real leads through a consistent short-form content system.",
          thumbnailUrl: `${SITE_URL}/testimonials/client-story-04.jpg`,
          contentUrl: `${SITE_URL}/testimonials/client-story-04.mp4`,
          uploadDate: "2026-10-18",
        },
      );
    }

    let script = document.head.querySelector<HTMLScriptElement>('script[data-stride-seo="structured-data"]');
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.strideSeo = "structured-data";
      document.head.appendChild(script);
    }
    script.text = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  }, [study, videoLibrary]);

  return null;
}
