import type { ResumeData } from "@/lib/types";

export const RESUME_DATA: ResumeData = {
  name: 'Mingjia "Jacky" Guan',
  initials: "MG",
  location: "New York Metropolitan Area",
  locationLink: "https://www.google.com/maps/place/New+York+Metropolitan+Area",
  about:
    "Trilingual ML/AI Engineer specializing in NLP, model evaluation, and production-grade classification systems.",
  summary: (
    <>
      Experienced Trilingual ML/AI Engineer with expertise in NLP, model
      evaluation, and advanced classification systems, delivering reliable,
      production-grade models. Currently architecting multi-agent,
      cross-department solutions at micro1 while pursuing MS in Quantum
      Computing, combining cutting-edge research with scalable enterprise
      deployment across international markets.
    </>
  ),
  avatarUrl: "https://avatars.githubusercontent.com/mxngjxa?v=4",
  personalWebsiteUrl: "https://github.com/mxngjxa",
  contact: {
    email: "mingjiaguan@icloud.com",
    tel: "+18453212480",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/mxngjxa",
        icon: "github",
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/mingjiaguan/",
        icon: "linkedin",
      },
    ],
  },
  education: [
    {
      school: "Fei Tian College - Northern Campus",
      degree: "MS in Quantum Computing",
      start: "2025",
      end: "2027",
    },
    {
      school: "Fei Tian College - Northern Campus",
      degree: "BS in Data Science, magna cum laude | GPA: 3.80",
      start: "2023",
      end: "2025",
    },
  ],
  work: [
    {
      company: "micro1, Inc.",
      link: "https://micro1.ai",
      badges: ["AI Engineering", "RAG", "Multi-Agent", "LLM"],
      title: "Member of Technical Staff, AI Engineering",
      start: "2025",
      end: null,
      description: (
        <>
          Led R&D and cross-functional delivery of multi-tenant RAG chatbot
          platform and multimodal ML systems, coordinating 4–5 QA teams
          simultaneously while reporting directly to C-suite on product
          strategy, technical roadmaps, and go-to-market execution.
        </>
      ),
    },
    {
      company: "MG Solutions",
      link: "",
      badges: ["DevOps", "Docker", "Nginx", "Self-Hosted"],
      title: "DevOps Engineer",
      start: "2025",
      end: null,
      description: (
        <>
          Migrated SMB clients from vendor-locked platforms (GoDaddy, Microsoft
          365) to self-hosted VPS infrastructure over 2–5 month engagements,
          architecting Docker-based environments with Nginx reverse proxy,
          Cloudflare DDoS protection, and Prometheus monitoring that eliminated
          recurring SaaS costs while maintaining 99.5% uptime.
        </>
      ),
    },
    {
      company: "Deledao Technologies Corp.",
      link: "https://deledao.com",
      badges: ["ML Engineering", "NLP", "TensorFlow", "Multilingual"],
      title: "Member of Technical Staff, ML Engineering",
      start: "2024",
      end: "2025",
      description: (
        <>
          Spearheaded multilingual ML classification system and cross-department
          automation R&D for content classification and student wellness
          products, deploying multi-tiered models achieving 96%+ F1 score /
          98%+ accuracy / sub-400ms latency for the Taiwanese market; built 10+
          internal automations scaling infrastructure for 3× sales growth.
        </>
      ),
    },
    {
      company: "FTC-NC",
      link: "https://ftc.edu",
      badges: ["Teaching", "Linear Algebra", "Data Mining"],
      title: "Adjunct Instructor / Teaching Assistant",
      start: "2024",
      end: "2025",
      description: (
        <>
          Instructor for Linear Algebra. Collaborated with faculty to tutor Data
          Mining and Data Structures & Algorithms students, deliver coursework
          feedback and exam prep, and create QMD/LaTeX lecture materials.
        </>
      ),
    },
  ],
  skills: [
    "Python",
    "TypeScript/JavaScript",
    "SQL",
    "R",
    "TensorFlow",
    "PyTorch",
    "Scikit-Learn / CuML",
    "Apache Spark / Kafka",
    "LGBM / XGBoost",
    "NLP / mmBERT",
    "Docker",
    "AWS / GCP / Azure",
    "RAG / Multi-Agent Systems",
    "Linux / Bash",
    "PostgreSQL / MongoDB",
  ],
  projects: [
    {
      title: "Dual-Layer Bilingual (EN/ZH) Web-Filter",
      techStack: ["Python", "TensorFlow", "CuML", "CuPy", "Jieba", "Docker"],
      description:
        "Dual-layer Chinese-English web filter for 13 sensitive categories in international K–12 markets, using linear regression token-frequency screening followed by context-aware mmBERT with per-category sensitivity tuning. Achieved 30× speedup via RAPIDS/TensorFlow GPU acceleration.",
    },
    {
      title: "LSH Recommendation System",
      techStack: ["Python", "JAX", "Redis", "PostgreSQL"],
      description:
        "Open-source Locality Sensitive Hashing library implementing hyperplane hashing with a modular pipeline for vectorization, signature generation, and JAX-parallelized similarity scoring. Achieves 15ms average query latency at 1M scale; pip-installable with CI/CD tooling (Ruff + UV).",
      link: {
        label: "github.com/mxngjxa",
        href: "https://github.com/mxngjxa",
      },
    },
  ],
} as const;
