export type IconType = "github" | "linkedin" | "x" | "globe" | "mail" | "phone";

export interface ResumeData {
  name: string;
  initials: string;
  location: string;
  locationLink: string;
  about: string;
  summary: string | React.ReactNode;
  avatarUrl: string;
  personalWebsiteUrl: string;
  contact: {
    email: string;
    tel: string;
    social: Array<{
      name: string;
      url: string;
      icon: IconType;
    }>;
  };
  education: Array<{
    school: string;
    degree: string;
    start: string;
    end: string;
    /** Month precision, "YYYY-MM". `start`/`end` stay year-only for the run. */
    startDate?: string;
    endDate?: string;
  }>;
  work: Array<{
    company: string;
    link: string;
    badges: string[];
    title: string;
    start: string;
    end: string | null;
    /** Month precision, "YYYY-MM"; `endDate: null` = current role. */
    startDate?: string;
    endDate?: string | null;
    description: string | React.ReactNode;
    /** Scannable résumé bullets, rendered as the gate card's list. */
    highlights: string[];
  }>;
  skills: string[];
  projects: Array<{
    title: string;
    techStack: string[];
    description: string;
    /** Human-readable span, e.g. "Jan – Nov 2025". */
    period?: string;
    link?: {
      label: string;
      href: string;
    };
  }>;
  /** Awards and certifications, newest first (résumé order). */
  awards: Array<{
    title: string;
    issuer: string;
    /** As printed on the résumé, e.g. "May 2026" or "as of May 2025". */
    date: string;
  }>;
}

/** Flatten JSX résumé copy to plain text (used for word-by-word reveals). */
export function reactToString(content: React.ReactNode): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map(reactToString).join("");
  }
  if (typeof content === "object" && content && "props" in content) {
    const { children } = content.props as { children?: React.ReactNode };
    if (children) return reactToString(children);
  }
  return "";
}
