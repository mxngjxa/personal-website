import type { ResumeData } from "@/lib/types";

export const RESUME_DATA: ResumeData = {
  name: 'Mingjia "Jacky" Guan',
  initials: "MG",
  location: "New York Metropolitan Area",
  locationLink: "https://www.google.com/maps/place/New+York+Metropolitan+Area",
  about:
    "Trilingual Research Engineer specializing in RL infrastructure and agentic evaluation at scale.",
  summary: (
    <>
      Trilingual Research Engineer specializing in RL infrastructure and agentic
      evaluation at scale (rollout orchestration, multi-provider sandboxing, and
      grading harnesses) sustaining thousands of concurrent coding agents.
      Currently core R&D at micro1 while pursuing an MS in Quantum Computing,
      with prior production ML experience in multilingual NLP, classification,
      and model evaluation across international markets.
    </>
  ),
  avatarUrl: "https://avatars.githubusercontent.com/mxngjxa?v=4",
  personalWebsiteUrl: "https://mguan.org",
  contact: {
    email: "mingjia.guan@outlook.com",
    tel: "+18453212480",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/mxngjxa",
        icon: "github",
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/mingjia-jacky-guan/",
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
      startDate: "2025-09",
      endDate: "2027-12",
    },
    {
      school: "Fei Tian College - Northern Campus",
      degree: "BS in Data Science, Magna Cum Laude",
      start: "2023",
      end: "2025",
      startDate: "2023-01",
      endDate: "2025-05",
    },
  ],
  work: [
    {
      company: "micro1, Inc.",
      link: "https://micro1.ai",
      badges: [
        "RL Infra",
        "Agentic Eval",
        "E2B / Modal / Daytona",
        "GCP / AWS",
      ],
      title: "Member of Technical Staff, Research Engineering",
      start: "2025",
      end: null,
      startDate: "2025-12",
      endDate: null,
      description: (
        <>
          Core research engineer owning in-house RL rollout infrastructure on
          GCP/AWS: orchestrated 3.5M+ agent rollouts across E2B, Modal, and
          Daytona, peaking at 60k+ runs/day across multi-model agentic coding
          and non-coding pipelines. Rebuilt the rollout stack twice in 3 months
          as customer and research needs shifted, cutting sandbox cold-start p50
          from 111s to 23s (−79%) at sustained load. Also led R&D for
          multi-tenant RAG and internal data-auditing platforms and drove
          client-facing evals for Fortune 50 accounts.
        </>
      ),
      highlights: [
        "Own RL rollout infra on GCP/AWS: 3.5M+ agent rollouts across E2B, Modal and Daytona, peaking at 60k+ runs/day.",
        "Rebuilt the rollout stack twice in 3 months; cut sandbox cold-start p50 111s\u00a0→\u00a023s (−79%) under load.",
        "Led R&D on multi-tenant RAG and data-auditing platforms; ran client evals for Fortune\u00a050 accounts.",
      ],
    },
    {
      company: "Deledao Technologies Corp.",
      link: "https://deledao.com",
      badges: ["ML Engineering", "NLP", "TensorFlow", "Multilingual"],
      title: "Member of Technical Staff, ML Engineering",
      start: "2024",
      end: "2025",
      startDate: "2024-08",
      endDate: "2025-12",
      description: (
        <>
          Spearheaded multilingual ML classification system and cross-department
          automation R&D for content classification and student wellness
          products, deploying multi-tiered models achieving 96%+ F1 score / 98%+
          accuracy / sub-400ms latency for the Taiwanese market; built 10+
          internal automations scaling infrastructure for 3× sales growth.
        </>
      ),
      highlights: [
        "Spearheaded multilingual ML classification system R&D for content classification and student wellness products.",
        "Deployed multi-tiered models for the Taiwanese market at 96%+ F1, 98%+ accuracy, and sub-400ms latency.",
        "Built 10+ internal automations through cross-department R&D, scaling infrastructure for 3× sales growth.",
      ],
    },
    {
      company: "MG Solutions",
      link: "https://solutions.mguan.org",
      badges: ["DevOps", "Docker", "Nginx", "Self-Hosted"],
      title: "Forward Deployed Engineer",
      start: "2025",
      end: null,
      startDate: "2025-03",
      endDate: null,
      description: (
        <>
          Migrated SMB clients from vendor-locked platforms (GoDaddy, Microsoft
          365) to self-hosted VPS infrastructure over 2–5 month engagements,
          architecting Docker-based environments with Nginx reverse proxy,
          Cloudflare DDoS protection, and Prometheus monitoring; eliminated
          recurring SaaS costs while maintaining 99.5% uptime.
        </>
      ),
      highlights: [
        "Migrated SMB clients off vendor-locked platforms (GoDaddy, Microsoft 365) to self-hosted VPS infrastructure over 2–5\u00a0month engagements.",
        "Architected Docker-based environments with Nginx reverse proxy, Cloudflare DDoS protection, and Prometheus monitoring.",
        "Eliminated recurring SaaS costs while maintaining 99.5% uptime.",
      ],
    },
    {
      company: "FTC-NC",
      link: "https://ftc.edu",
      badges: ["Teaching", "Linear Algebra", "Data Mining"],
      title: "Adjunct Instructor / Teaching Assistant",
      start: "2024",
      end: "2025",
      startDate: "2024-01",
      endDate: "2025-12",
      description: (
        <>
          Instructor for Linear Algebra. Collaborated with faculty to tutor Data
          Mining and Data Structures & Algorithms students, deliver coursework
          feedback and exam prep, and create QMD/LaTeX lecture materials.
        </>
      ),
      highlights: [
        "Taught Linear Algebra as instructor.",
        "Collaborated with faculty to tutor Data Mining and Data Structures & Algorithms students.",
        "Delivered coursework feedback and exam prep; created QMD/LaTeX lecture materials.",
      ],
    },
  ],
  skills: [
    "Python",
    "TypeScript/JavaScript",
    "Go",
    "SQL",
    "R",
    "Linux / Bash",
    "PyTorch",
    "TensorFlow",
    "Scikit-Learn / CuML",
    "LGBM / XGBoost",
    "Pandas / CuDF",
    "NLP / mmBERT",
    "E2B / Modal / Daytona",
    "Rollout Orchestration",
    "SxS Eval Harnesses",
    "RAG / Multi-Agent Systems",
    "Apache Spark / Kafka / Airflow",
    "TFX / TorchServe",
    "Docker",
    "AWS / GCP / Azure",
    "PostgreSQL / MongoDB",
  ],
  projects: [
    {
      title: "Dual-Layer Bilingual (EN/ZH) Web-Filter",
      techStack: ["Python", "TensorFlow", "CuML", "CuPy", "Jieba", "Docker"],
      description:
        "Built and deployed a two-stage EN/ZH web filter for 13 sensitive categories in K–12 markets: token-frequency screening feeds a context-aware mmBERT transformer with per-category sensitivity tuning. Training runs 30× faster via RAPIDS/TensorFlow GPU acceleration, served through a containerized end-to-end TFX pipeline.",
      period: "Jan – Nov 2025",
    },
    {
      title: "LSH Recommendation System",
      techStack: ["Python", "JAX", "Redis"],
      description:
        "Open-source, pip-installable Locality Sensitive Hashing library with hyperplane hashing, JAX-parallelized scoring, a Redis bucket store, and Ruff/UV CI/CD. ~15ms query latency at 1M scale (projected 228ms at 1B); deployed for RAG retrieval on resource-constrained hardware.",
      period: "May 2025 – Present",
      link: {
        label: "github.com/mxngjxa/lshrs",
        href: "https://github.com/mxngjxa/lshrs",
      },
    },
  ],
  awards: [
    {
      title: "Certificate of Department Superstar, AI Team",
      issuer: "micro1",
      date: "May 2026",
    },
    {
      title: "Microsoft AI & ML Engineering",
      issuer: "Microsoft",
      date: "February 2026",
    },
    {
      title: "AWS Cloud Solutions Architect",
      issuer: "Amazon Web Services (AWS)",
      date: "January 2026",
    },
    {
      title: "IBM Deep Learning with PyTorch, Keras and TensorFlow",
      issuer: "IBM",
      date: "November 2025",
    },
    {
      title: "(MLH) Best Use of Google Gemini API",
      issuer: "HackRPI 2025",
      date: "November 2025",
    },
    {
      title: "Advanced Machine Learning on Google Cloud",
      issuer: "Google Cloud",
      date: "November 2024",
    },
    {
      title: "Natural Language Processing (NLP) Specialization",
      issuer: "DeepLearning.AI",
      date: "November 2024",
    },
    {
      title: "Deep Learning Specialization",
      issuer: "DeepLearning.AI",
      date: "October 2024",
    },
    {
      title: "IBM Data Engineering Professional Certificate",
      issuer: "IBM",
      date: "September 2024",
    },
    {
      title: "5× Dean's List, 3× Department Academic Excellence Award",
      issuer: "FTC-NC",
      date: "as of May 2025",
    },
  ],
} as const;
