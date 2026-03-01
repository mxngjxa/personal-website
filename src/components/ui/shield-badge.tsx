interface BadgeConfig {
  color: string;
  logo?: string;
  logoColor?: string;
}

const BADGE_MAP: Record<string, BadgeConfig> = {
  // Languages
  python: { color: "3776AB", logo: "python", logoColor: "fff" },
  "typescript/javascript": { color: "3178C6", logo: "typescript", logoColor: "fff" },
  typescript: { color: "3178C6", logo: "typescript", logoColor: "fff" },
  javascript: { color: "F7DF1E", logo: "javascript", logoColor: "000" },
  sql: { color: "4479A1", logo: "mysql", logoColor: "fff" },
  r: { color: "276DC3", logo: "r", logoColor: "fff" },
  java: { color: "ED8B00", logo: "openjdk", logoColor: "fff" },
  bash: { color: "4EAA25", logo: "gnubash", logoColor: "fff" },
  "linux / bash": { color: "FCC624", logo: "linux", logoColor: "000" },

  // ML / AI
  tensorflow: { color: "FF6F00", logo: "tensorflow", logoColor: "fff" },
  pytorch: { color: "EE4C2C", logo: "pytorch", logoColor: "fff" },
  jax: { color: "A020F0", logoColor: "fff" },
  "scikit-learn / cuml": { color: "F7931E", logo: "scikitlearn", logoColor: "fff" },
  "lgbm / xgboost": { color: "189AB4", logoColor: "fff" },
  "nlp / mmbert": { color: "412991", logo: "openai", logoColor: "fff" },
  nlp: { color: "412991", logoColor: "fff" },
  "ml engineering": { color: "FF6F00", logo: "tensorflow", logoColor: "fff" },
  "ai engineering": { color: "10A37F", logo: "openai", logoColor: "fff" },
  llm: { color: "10A37F", logo: "openai", logoColor: "fff" },
  rag: { color: "0052CC", logoColor: "fff" },
  "multi-agent": { color: "6366F1", logoColor: "fff" },
  "rag / multi-agent systems": { color: "6366F1", logoColor: "fff" },
  multilingual: { color: "0070F3", logoColor: "fff" },
  cuml: { color: "76B900", logo: "nvidia", logoColor: "fff" },
  cupy: { color: "76B900", logo: "nvidia", logoColor: "fff" },
  jieba: { color: "DE2910", logoColor: "fff" },
  "apache spark / kafka": { color: "E25A1C", logo: "apachespark", logoColor: "fff" },

  // Cloud / DevOps
  docker: { color: "2496ED", logo: "docker", logoColor: "fff" },
  nginx: { color: "009639", logo: "nginx", logoColor: "fff" },
  "self-hosted": { color: "6B7280", logo: "homeassistant", logoColor: "fff" },
  devops: { color: "0078D4", logo: "azuredevops", logoColor: "fff" },
  "aws / gcp / azure": { color: "FF9900", logo: "amazonaws", logoColor: "fff" },
  aws: { color: "FF9900", logo: "amazonaws", logoColor: "fff" },
  gcp: { color: "4285F4", logo: "googlecloud", logoColor: "fff" },
  azure: { color: "0078D4", logo: "microsoftazure", logoColor: "fff" },
  linux: { color: "FCC624", logo: "linux", logoColor: "000" },

  // Databases
  "postgresql / mongodb": { color: "4169E1", logo: "postgresql", logoColor: "fff" },
  postgresql: { color: "4169E1", logo: "postgresql", logoColor: "fff" },
  mongodb: { color: "47A248", logo: "mongodb", logoColor: "fff" },
  redis: { color: "FF4438", logo: "redis", logoColor: "fff" },

  // Teaching / other
  teaching: { color: "6B7280", logo: "academia", logoColor: "fff" },
  "linear algebra": { color: "6B7280", logoColor: "fff" },
  "data mining": { color: "6B7280", logoColor: "fff" },
};

function encodeLabel(text: string): string {
  return text.replace(/-/g, "--").replace(/_/g, "__").replace(/\s+/g, "_");
}

export function ShieldBadge({ label }: { label: string }) {
  const config = BADGE_MAP[label.toLowerCase()] ?? { color: "6B7280" };
  const params: Record<string, string> = { style: "plastic" };
  if (config.logo) params.logo = config.logo;
  if (config.logoColor) params.logoColor = config.logoColor;

  const query = new URLSearchParams(params).toString();
  const url = `https://img.shields.io/badge/${encodeLabel(label)}-${config.color}?${query}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={label} height={18} className="inline-block" />
  );
}
