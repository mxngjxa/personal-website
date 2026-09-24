import { RESUME_DATA } from "@/data/resume-data";

/**
 * Headline role, shared by the page title, the JSON-LD and the OG card
 * (scripts/og-image.py keeps its own copy in capitals).
 */
export const ROLE = "Research Engineer";

/** `Mingjia "Jacky" Guan — Research Engineer` */
export const SITE_TITLE = `${RESUME_DATA.name} — ${ROLE}`;

/** Brand for og:site_name and the JSON-LD WebSite. */
export const SITE_NAME = RESUME_DATA.name;

/**
 * Content dates, fixed so rebuilds don't churn the sitemap or JSON-LD.
 * Bump SITE_UPDATED when the résumé content changes.
 */
export const SITE_CREATED = "2026-03-01";
export const SITE_UPDATED = "2026-09-23";

const PERSON_ID = `${RESUME_DATA.personalWebsiteUrl}/#person`;

const WEBSITE = {
  "@type": "WebSite",
  name: SITE_NAME,
  url: RESUME_DATA.personalWebsiteUrl,
};

export function generatePersonStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: RESUME_DATA.name,
    alternateName: RESUME_DATA.initials,
    description: RESUME_DATA.about,
    url: RESUME_DATA.personalWebsiteUrl,
    image: RESUME_DATA.avatarUrl,
    sameAs: RESUME_DATA.contact.social.map((social) => social.url),
    address: {
      "@type": "Place",
      name: RESUME_DATA.location,
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: RESUME_DATA.contact.email,
      telephone: RESUME_DATA.contact.tel,
      contactType: "personal",
    },
    jobTitle: ROLE,
    worksFor:
      RESUME_DATA.work.length > 0
        ? {
            "@type": "Organization",
            name: RESUME_DATA.work[0].company,
            url: RESUME_DATA.work[0].link,
          }
        : undefined,
    // One entry per school (two degrees from the same college).
    alumniOf: [...new Set(RESUME_DATA.education.map((e) => e.school))].map(
      (school) => ({ "@type": "EducationalOrganization", name: school })
    ),
    hasOccupation: RESUME_DATA.work.map((job) => ({
      "@type": "Occupation",
      name: job.title,
      description: job.highlights.join(" "),
      occupationLocation: {
        "@type": "Place",
        name: RESUME_DATA.location,
      },
      occupationalCategory: "Research and Machine Learning Engineering",
    })),
    knowsAbout: RESUME_DATA.skills,
    award: RESUME_DATA.awards.map((a) => `${a.title} (${a.issuer}, ${a.date})`),
  };
}

export function generateWebPageStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: SITE_TITLE,
    description: RESUME_DATA.about,
    url: RESUME_DATA.personalWebsiteUrl,
    inLanguage: "en-US",
    isPartOf: WEBSITE,
    about: { "@id": PERSON_ID },
    mainEntity: generatePersonStructuredData(),
  };
}

export function generateResumeStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateCreated: SITE_CREATED,
    dateModified: SITE_UPDATED,
    mainEntity: generatePersonStructuredData(),
    // Same person as mainEntity: reference it rather than repeat it.
    about: { "@id": PERSON_ID },
    name: SITE_TITLE,
    description: `Résumé of ${RESUME_DATA.name}. ${RESUME_DATA.about}`,
    url: RESUME_DATA.personalWebsiteUrl,
    inLanguage: "en-US",
    isPartOf: WEBSITE,
  };
}
