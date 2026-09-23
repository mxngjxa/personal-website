import type { ReactNode } from "react";
import type { SignKind } from "./run-data";

/**
 * Resort trail-difficulty signs, drawn on a 12x12 pixel grid so they stay
 * crisp at any size (shape-rendering: crispEdges). Always decorative — the
 * section headings carry the text.
 */
const DIAMOND =
  "M5 1h2v1h1v1h1v1h1v1h1v2h-1v1h-1v1h-1v1h-1v1h-2v-1h-1v-1h-1v-1h-1v-1h-1v-2h1v-1h1v-1h1v-1h1z";

const CHECKER = [0, 1, 2, 3, 4].flatMap((r) =>
  [0, 1, 2, 3, 4].filter((c) => (r + c) % 2 === 0).map((c) => [r, c])
);

/** Pixel medal: a red/blue V ribbon over an ink disc with a plate glint. */
const RIBBON = "M1 0h3v1h1v1h1v2H4V3H3V2H2V1H1z";
const MEDAL = "M4 4h4v1h1v1h1v4H9v1H8v1H4v-1H3v-1H2V6h1V5h1z";

function shapes(kind: SignKind): ReactNode {
  switch (kind) {
    case "green":
      return <circle cx="6" cy="6" r="5.25" fill="var(--piste-green)" />;
    case "blue":
      return (
        <rect x="1" y="1" width="10" height="10" fill="var(--piste-blue)" />
      );
    case "black":
      return <path d={DIAMOND} fill="var(--sign-ink)" />;
    case "double":
      return (
        <>
          <path d={DIAMOND} fill="var(--sign-ink)" />
          <path d={DIAMOND} fill="var(--sign-ink)" transform="translate(8 0)" />
        </>
      );
    case "summit":
      return (
        <>
          <path
            d="M6 1h1v1h1v2h1v2h1v2h1v3H1V8h1V6h1V4h1V2h1V1z"
            fill="var(--sign-ink)"
          />
          <path d="M6 1h1v1h1v2H7v1H6V4H5V2h1z" fill="var(--sign-plate)" />
        </>
      );
    case "podium":
      return (
        <>
          <path d={RIBBON} fill="var(--gate-red)" />
          <path
            d={RIBBON}
            fill="var(--piste-blue)"
            transform="matrix(-1 0 0 1 12 0)"
          />
          <path d={MEDAL} fill="var(--sign-ink)" />
          <path d="M4 6h2v1H5v1H4z" fill="var(--sign-plate)" />
        </>
      );
    case "finish":
      return (
        <>
          <rect x="1" y="1" width="10" height="10" fill="var(--sign-plate)" />
          {CHECKER.map(([r, c]) => (
            <rect
              key={`${r}-${c}`}
              x={1 + c * 2}
              y={1 + r * 2}
              width="2"
              height="2"
              fill="var(--sign-ink)"
            />
          ))}
          <rect
            x="0.5"
            y="0.5"
            width="11"
            height="11"
            fill="none"
            stroke="var(--sign-ink)"
            strokeWidth="1"
          />
        </>
      );
  }
}

export function TrailSign({
  kind,
  size = 28,
  className,
}: {
  kind: SignKind;
  size?: number;
  className?: string;
}) {
  const wide = kind === "double";
  return (
    <svg
      width={wide ? size * 1.6 : size}
      height={size}
      viewBox={wide ? "0 0 20 12" : "0 0 12 12"}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={`trail-sign trail-sign--${kind}${className ? ` ${className}` : ""}`}
    >
      {shapes(kind)}
    </svg>
  );
}
