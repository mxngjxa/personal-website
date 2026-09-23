import type { CSSProperties, ReactNode } from "react";
import { RESUME_DATA } from "@/data/resume-data";
import { reactToString } from "@/lib/types";
import {
  buildSplits,
  NAME,
  NOW_YEAR,
  type SignKind,
  seeded,
  yearSpan,
} from "./run-data";
import { TrailSign } from "./TrailSign";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* ------------------------------------------------------------------------- */

function SectionHead({
  sign,
  kicker,
  title,
  id,
}: {
  sign: SignKind;
  kicker: string;
  title: string;
  id: string;
}) {
  return (
    <header className="sec-head">
      <span className={`sec-head__plate sec-head__plate--${sign}`}>
        <TrailSign kind={sign} size={36} />
      </span>
      <div>
        <p className="sec-head__kicker">{kicker}</p>
        <h2 className="sec-head__title" id={id}>
          {title}
        </h2>
      </div>
    </header>
  );
}

function Arrow() {
  return (
    <span className="arrow" aria-hidden="true">
      ↗
    </span>
  );
}

/* ------------------------------------------------------------------------- */
/* ● GREEN — THE LINE                                                         */
/* ------------------------------------------------------------------------- */

export function TheLine() {
  const words = reactToString(RESUME_DATA.summary)
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  const { email, tel, social } = RESUME_DATA.contact;

  return (
    <section
      id="the-line"
      className="run-sec"
      data-run="line"
      data-lane="0.84"
      data-lane-m="0.3"
      aria-labelledby="the-line-title"
    >
      <div className="d-container">
        <div className="d-measure">
          <SectionHead
            sign="green"
            kicker="GREEN CIRCLE · EASIEST"
            title="The Line"
            id="the-line-title"
          />
          <p
            className="line-text"
            data-scrub={true}
            style={{ "--n": words.length } as Vars}
          >
            {words.map((w, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: static word list
                key={i}
                className="w"
                style={{ "--i": i } as Vars}
              >
                {w}{" "}
              </span>
            ))}
          </p>

          <p className="line-loc">
            <span className="line-loc__tag">BASE</span>
            <a href={RESUME_DATA.locationLink} target="_blank" rel="noreferrer">
              {RESUME_DATA.location}
            </a>
          </p>

          <ul className="contact-row">
            <li>
              <a className="brut-btn" href={`mailto:${email}`}>
                EMAIL <Arrow />
                <span className="sr-only">{email}</span>
              </a>
            </li>
            <li>
              <a className="brut-btn" href={`tel:${tel}`}>
                CALL <Arrow />
                <span className="sr-only">{tel}</span>
              </a>
            </li>
            {social.map((s) => (
              <li key={s.name}>
                <a
                  className="brut-btn"
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.name} <Arrow />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* ■ BLUE — GATES                                                             */
/* ------------------------------------------------------------------------- */

export function Gates() {
  return (
    <section
      id="gates"
      className="run-sec gates-sec"
      data-run="gates"
      aria-labelledby="gates-title"
    >
      <div className="d-container">
        <SectionHead
          sign="blue"
          kicker="BLUE SQUARE · INTERMEDIATE"
          title="Gates"
          id="gates-title"
        />
        <ol className="gates">
          {RESUME_DATA.work.map((job, i) => {
            const side = i % 2 === 0 ? "left" : "right";
            const color = i % 2 === 0 ? "red" : "blue";
            const live = job.end === null;
            return (
              <li
                key={`${job.company}-${job.start}`}
                className={`gate gate--${side} gate--${color}`}
              >
                <span
                  className="gate__pole"
                  data-gate={side}
                  aria-hidden="true"
                />
                <article className="gate__flag brut-card" data-reveal={true}>
                  <div className="gate__strip">
                    <span>GATE {String(i + 1).padStart(2, "0")}</span>
                    <span>{yearSpan(job.start, job.end)}</span>
                  </div>
                  <div className="gate__body">
                    <div className="gate__head">
                      <h3 className="gate__company">
                        <a href={job.link} target="_blank" rel="noreferrer">
                          {job.company}
                        </a>
                      </h3>
                      {live ? (
                        <span className="live">
                          <i aria-hidden="true" />
                          LIVE
                        </span>
                      ) : null}
                    </div>
                    <p className="gate__title">{job.title}</p>
                    <p className="gate__desc">{job.description}</p>
                    <ul className="chips" aria-label="Focus areas">
                      {job.badges.map((b) => (
                        <li key={b} className="chip">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* ◆ BLACK DIAMOND — OFF-PISTE                                                */
/* ------------------------------------------------------------------------- */

export function OffPiste() {
  return (
    <section
      id="off-piste"
      className="run-sec"
      data-run="offpiste"
      data-lane="0.84"
      data-lane-m="0.3"
      aria-labelledby="off-piste-title"
    >
      <div className="d-container">
        <div className="d-measure">
          <SectionHead
            sign="black"
            kicker="BLACK DIAMOND · ADVANCED"
            title="Off-Piste"
            id="off-piste-title"
          />
          <div className="projects">
            {RESUME_DATA.projects.map((p, i) => (
              <article
                key={p.title}
                className="project brut-card"
                data-reveal={true}
              >
                <div className="project__bar">
                  <span className="project__num">
                    LINE {String(i + 1).padStart(2, "0")}
                    {p.period ? (
                      <span className="project__period">{p.period}</span>
                    ) : null}
                  </span>
                  <span className="project__warn">
                    <TrailSign kind="black" size={12} />
                    EXPERTS ONLY
                  </span>
                </div>
                <div className="project__body">
                  <h3 className="project__title">{p.title}</h3>
                  <p className="project__desc">{p.description}</p>
                  <ul className="chips" aria-label="Tech stack">
                    {p.techStack.map((t) => (
                      <li key={t} className="chip chip--ink">
                        {t}
                      </li>
                    ))}
                  </ul>
                  {p.link ? (
                    <a
                      className="brut-btn brut-btn--blue"
                      href={p.link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {p.link.label} <Arrow />
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* ◆◆ DOUBLE BLACK — GEAR CHECK                                               */
/* ------------------------------------------------------------------------- */

const STICKER_TONES = ["snow", "ice", "red", "blue", "ink"] as const;

export function GearCheck() {
  const skills = RESUME_DATA.skills;
  return (
    <section
      id="gear-check"
      className="run-sec"
      data-run="gear"
      data-lane="0.84"
      data-lane-m="0.3"
      aria-labelledby="gear-check-title"
    >
      <div className="d-container">
        <div className="d-measure">
          <SectionHead
            sign="double"
            kicker="DOUBLE BLACK · EXPERT"
            title="Gear Check"
            id="gear-check-title"
          />
          <div className="ski-board" data-reveal={true}>
            <p className="ski-board__spec" aria-hidden="true">
              <span>MG/{NOW_YEAR} PRO</span>
              <span>{skills.length} STICKERS</span>
              <span>WAXED ✓</span>
            </p>
            <ul className="gear">
              {skills.map((s, i) => {
                const rot = ((seeded(i + 1) * 2 - 1) * 5).toFixed(2);
                const tone =
                  STICKER_TONES[
                    Math.floor(seeded(i + 101) * STICKER_TONES.length)
                  ];
                return (
                  <li
                    key={s}
                    className={`gear__chip gear__chip--${tone}`}
                    style={{ "--rot": `${rot}deg` } as Vars}
                  >
                    {s}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* PODIUM — awards & certifications                                           */
/* ------------------------------------------------------------------------- */

const PODIUM_TONES = ["red", "blue", "ink"] as const;
const num = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Awards aren't placings: the three steps are simply the latest three, in
 * résumé order, stepping down like the run itself. The rest is the sheet.
 */
export function Podium() {
  const awards = RESUME_DATA.awards;
  const top = awards.slice(0, 3);
  const rest = awards.slice(3);

  return (
    <section
      id="podium"
      className="run-sec"
      data-run="podium"
      data-lane="0.84"
      data-lane-m="0.3"
      aria-labelledby="podium-title"
    >
      <div className="d-container">
        <div className="d-measure">
          <SectionHead
            sign="podium"
            kicker="PODIUM · RESULTS"
            title="Podium"
            id="podium-title"
          />

          <p className="podium__kicker">
            {awards.length} AWARDS &amp; CERTIFICATIONS · NEWEST FIRST
          </p>
          <ol className="podium" data-reveal={true}>
            {top.map((a, i) => (
              <li
                key={`${a.title}-${a.date}`}
                className={`podium__step podium__step--${PODIUM_TONES[i]}`}
                style={{ "--step": i } as Vars}
              >
                <p className="podium__strip">
                  <span>#{num(i)}</span>
                  <span>{a.date}</span>
                </p>
                <div className="podium__body">
                  <h3 className="podium__title">{a.title}</h3>
                  <p className="podium__issuer">{a.issuer}</p>
                </div>
              </li>
            ))}
          </ol>

          {rest.length > 0 ? (
            <div className="sheet" data-reveal={true}>
              <div className="sheet__cap" aria-hidden="true">
                <span>RESULTS SHEET</span>
                <span>
                  #{num(top.length)}–#{num(awards.length - 1)}
                </span>
              </div>
              <table className="sheet__table">
                <caption className="sr-only">
                  More awards and certifications, newest first
                </caption>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">AWARD</th>
                    <th scope="col">ISSUER</th>
                    <th scope="col">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((a, i) => (
                    <tr key={`${a.title}-${a.date}`}>
                      <td className="sheet__no">{num(i + top.length)}</td>
                      <td className="sheet__title">{a.title}</td>
                      <td className="sheet__issuer">{a.issuer}</td>
                      <td className="sheet__date">{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* BASE LODGE — FINISH                                                        */
/* ------------------------------------------------------------------------- */

export function Finish({ baseYear }: { baseYear: number }) {
  const splits = buildSplits();
  const { email, social } = RESUME_DATA.contact;

  return (
    <section
      id="finish"
      className="run-sec finish-sec"
      data-run="finish"
      data-lane="0.84"
      data-lane-m="0.3"
      aria-labelledby="finish-title"
    >
      <div className="d-container">
        <div className="d-measure">
          <SectionHead
            sign="finish"
            kicker="BASE LODGE"
            title="Finish"
            id="finish-title"
          />

          {/* The canvas paints the checkered finish line along this box's top
              edge; the skier hockey-stops in the run-out below it. */}
          <div
            className="finish-line"
            data-finish-line={true}
            aria-hidden="true"
          />

          <div className="board-wrap" data-reveal={true}>
            <div className="board__cap" aria-hidden="true">
              <span>OFFICIAL TIMING</span>
              <span>RUN: THE GUAN</span>
            </div>
            <table className="board">
              <caption className="sr-only">
                Official timing: every role and degree, newest first
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="board__split">
                    SPLIT
                  </th>
                  <th scope="col">GATE</th>
                  <th scope="col">TIME</th>
                </tr>
              </thead>
              <tbody>
                {splits.map((s) => (
                  <tr key={`${s.who}-${s.detail}`}>
                    <td className="board__split">{s.label}</td>
                    <td className="board__who">
                      {s.who}
                      <span className="board__detail">{s.detail}</span>
                    </td>
                    <td className="board__time">
                      {s.start}–{s.end}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="board__split">FINISH</td>
                  <td className="board__who">{NAME.plain}</td>
                  <td className="board__time">{baseYear} → NOW</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <h3 className="finish__sub">Ski School</h3>
          <div className="edu">
            {RESUME_DATA.education.map((e) => (
              <article
                key={`${e.school}-${e.degree}`}
                className="edu__card brut-card"
                data-reveal={true}
              >
                <p className="edu__years">
                  {e.start} — {e.end}
                </p>
                <h4 className="edu__degree">{e.degree}</h4>
                <p className="edu__school">{e.school}</p>
              </article>
            ))}
          </div>

          <div className="cta">
            <p className="cta__kicker">LIFT LINE IS OPEN</p>
            <a className="say-hi" href={`mailto:${email}`}>
              Say hi <span aria-hidden="true">→</span>
              <span className="sr-only"> — email {email}</span>
            </a>
            <ul className="contact-row">
              {social.map((s) => (
                <li key={s.name}>
                  <a
                    className="brut-btn"
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.name} <Arrow />
                  </a>
                </li>
              ))}
              <li>
                <a
                  className="brut-btn"
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  RESUME PDF <Arrow />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RunFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="d-footer">
      <div className="d-container d-footer__row">
        <span>
          © {NOW_YEAR} {NAME.plain.toUpperCase()}
        </span>
        <span aria-hidden="true">·</span>
        <span>BUILT FOR THE DESCENT</span>
        <span aria-hidden="true">·</span>
        <a href="#summit">
          CHAIRLIFT BACK UP <span aria-hidden="true">↑</span>
        </a>
        {children}
      </div>
    </footer>
  );
}
