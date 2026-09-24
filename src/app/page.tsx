import type { Metadata } from "next";
import { RESUME_DATA } from "@/data/resume-data";
import {
  generateResumeStructuredData,
  SITE_NAME,
  SITE_TITLE,
} from "@/lib/structured-data";
import { Hud } from "./descent/Hud";
import { PixelRun } from "./descent/PixelRun";
import {
  ALT_BASE,
  ALT_TOP,
  BASE_YEAR,
  NAME,
  NOW_YEAR,
} from "./descent/run-data";
import { ScrollFx } from "./descent/ScrollFx";
import {
  Finish,
  Gates,
  GearCheck,
  OffPiste,
  Podium,
  RunFooter,
  TheLine,
} from "./descent/Sections";
import { Summit } from "./descent/Summit";
import { TrailMap } from "./descent/TrailMap";
import "./descent/descent.css";

// The home page IS the site, so skip the layout's "%s | name" template. The
// OG/Twitter images come from opengraph-image.png / twitter-image.png.
export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: RESUME_DATA.about,
  openGraph: {
    title: SITE_TITLE,
    description: RESUME_DATA.about,
    type: "profile",
    firstName: NAME.first,
    lastName: NAME.last,
    locale: "en_US",
    url: RESUME_DATA.personalWebsiteUrl,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: RESUME_DATA.about,
  },
};

/**
 * DESCENT — the résumé as one ski run. Top of the page is the summit (now),
 * the bottom is the base lodge (the first year on the résumé).
 */
export default function DescentPage() {
  const structuredData = generateResumeStructuredData();

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe for JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="descent">
        <a className="skip-link" href="#the-line">
          Skip to content
        </a>
        <PixelRun />
        <Hud
          altTop={ALT_TOP}
          altBase={ALT_BASE}
          yearTop={NOW_YEAR}
          yearBase={BASE_YEAR}
        />
        <TrailMap />
        <ScrollFx />
        <main id="main-content" className="descent__main">
          <Summit
            first={NAME.first}
            last={NAME.last}
            nick={NAME.nick}
            fullName={RESUME_DATA.name}
            about={RESUME_DATA.about}
          />
          <TheLine />
          <Gates />
          <OffPiste />
          <GearCheck />
          <Podium />
          <Finish />
        </main>
        <RunFooter />
        <p className="print-note">
          A printer-friendly PDF of this résumé lives at mguan.org/resume.pdf
        </p>
      </div>
    </>
  );
}
