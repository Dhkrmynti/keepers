/**
 * The tide: the loop the engine runs, drawn as a tidal curve. Trading fees fill the Pons fee escrow
 * like a rising tide; at the first high water the ten on watch are paid, at the next the treasury
 * is, then round again. No buyback, no burn: the engine never buys or destroys the token.
 * The curve is drawn as you scroll; the water stands where the escrow stands now.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEFAULT_TIERS, STEP, addrUrl, short, stepShare, type RoundKind, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";
import { useMedia } from "./Bits";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const BASE = 360;
const TOP = 70;

/** One rising limb: from low water at x0 to high water at x1, then the drop when the step is paid. */
function limb(x0: number, x1: number, crest: number) {
  const m = x0 + (x1 - x0) * 0.55;
  return { p0: [x0, BASE], c1: [m, BASE], c2: [m, crest], p1: [x1, crest] } as const;
}
const bez = (t: number, a: number, b: number, c: number, d: number) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;

export function Tide({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const live = !!status?.tokenAddress;
  const at = live ? status!.cycle.index : -1;
  const escrow = parseFloat(status?.escrowETH ?? "0");
  const treasury = live ? status?.treasuryAddress : "";
  // on a phone the sheet is drawn narrower, so the lettering stays readable at the screen's width
  const narrow = useMedia("(max-width: 640px)");
  const W = narrow ? 560 : 1200;

  const max = Math.max(...steps.map((s) => parseFloat(s.thresholdETH)), 0.0001);
  const seg = W / steps.length;
  const limbs = steps.map((s, i) => limb(i * seg + 10, (i + 1) * seg - 34, BASE - ((BASE - TOP) * parseFloat(s.thresholdETH)) / max));
  const d = limbs.map((l, i) => `${i ? "L" : "M"}${l.p0.join(" ")} C${l.c1.join(" ")} ${l.c2.join(" ")} ${l.p1.join(" ")} L${l.p1[0] + 24} ${BASE}`).join(" ");

  // where the water stands now: on the rising limb of the step being filled
  const now = at >= 0 ? limbs[at] : null;
  const fill = now ? Math.max(0, Math.min(1, escrow / parseFloat(steps[at].thresholdETH))) : 0;
  const mark = now ? ([bez(fill, now.p0[0], now.c1[0], now.c2[0], now.p1[0]), bez(fill, now.p0[1], now.c1[1], now.c2[1], now.p1[1])] as const) : null;
  const water = now
    ? `M${now.p0[0]} ${BASE} ${Array.from({ length: 24 }, (_, k) => {
        const t = (fill * (k + 1)) / 24;
        return `L${bez(t, now.p0[0], now.c1[0], now.c2[0], now.p1[0]).toFixed(1)} ${bez(t, now.p0[1], now.c1[1], now.c2[1], now.p1[1]).toFixed(1)}`;
      }).join(" ")} L${mark![0].toFixed(1)} ${BASE} Z`
    : "";

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the curve is plotted across the sheet as you read it; the water then comes in to where it stands
      gsap.fromTo(".tide__curve", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".tide__plot", start: "top 80%", end: "bottom 45%", scrub: 0.5 } });
      gsap.from(".tide__water", { scaleY: 0, transformOrigin: "50% 100%", ease: "none", scrollTrigger: { trigger: ".tide__plot", start: "top 55%", end: "bottom 40%", scrub: 0.5 } });
      gsap.from(".tide__hw", { opacity: 0, x: -24, duration: 0.6, ease: "expo.out", stagger: 0.15, scrollTrigger: { trigger: ".tide__plot", start: "top 60%" } });
      gsap.from(".stage", { y: 26, opacity: 0, duration: 0.7, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".stages", start: "top 82%" } });
    },
    { scope: root },
  );

  const line = (kind: RoundKind) =>
    kind === "feeding"
      ? `ETH straight to the ten on watch. No. 1-5 split ${tiers[0]?.eth ?? "0.014"}, No. 6-10 split ${tiers[1]?.eth ?? "0.006"}, by balance in each watch.`
      : "ETH to the treasury wallet. Every transfer is in the log below.";

  return (
    <section className="sec tide" id="tide" ref={root} aria-labelledby="tide-head">
      <div className="wrap">
        <header className="tide__head">
          <h2 className="h2" id="tide-head">
            Every trade raises the tide.
          </h2>
          <p className="deck">Each trade's creator fee builds up in the Pons fee escrow. At the next high water the engine collects it and runs that step. Then the other one, then round again.</p>
        </header>

        <figure className="tide__plot">
          <svg viewBox={`0 -20 ${W} 420`} role="img" aria-label={`Tidal curve of the loop: ${steps.map((s) => `${STEP[s.kind].name} at ${s.thresholdETH} ETH`).join(", then ")}`}>
            {[0, 1, 2, 3, 4].map((k) => (
              <path key={k} d={`M0 ${BASE - k * 72.5} H${W}`} className="tide__grid" />
            ))}
            {water ? <path className="tide__water" d={water} /> : null}
            {limbs.map((l, i) => (
              <g key={i} className="tide__hw">
                <path d={`M${l.p0[0]} ${l.p1[1]} H${l.p1[0] + 24}`} className="tide__hwline" />
                <text x={l.p1[0] - 4} y={l.p1[1] - 14} textAnchor="end" className="tide__hwlabel">
                  {narrow ? (
                    <>
                      <tspan x={l.p1[0] - 4} dy="-1.1em">
                        High water
                      </tspan>
                      <tspan x={l.p1[0] - 4} dy="1.1em">
                        {STEP[steps[i].kind].name} · {steps[i].thresholdETH} ETH
                      </tspan>
                    </>
                  ) : (
                    <>
                      High water · {STEP[steps[i].kind].name} · {steps[i].thresholdETH} ETH
                    </>
                  )}
                </text>
              </g>
            ))}
            <path className="tide__curve" d={d} pathLength={1} />
            {mark ? (
              <g transform={`translate(${mark[0]} ${mark[1]})`} className="tide__now">
                <circle r="9" />
                <circle r="3.5" className="tide__dot" />
                <text x="16" y="-12" className="tide__nowlabel">
                  {escrow.toFixed(4)} ETH now
                </text>
              </g>
            ) : null}
            <text x={W - 4} y={BASE + 30} textAnchor="end" className="tide__again">
              then round again
            </text>
          </svg>
        </figure>

        <ol className="stages" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((s, i) => {
            const isNow = at === i;
            const level = parseFloat(s.thresholdETH);
            return (
              <li key={i} className={`stage is-${s.kind} ${isNow ? "is-now" : ""}`} aria-current={isNow ? "step" : undefined}>
                <h3 className="stage__name">{STEP[s.kind].name}</h3>
                <p className="stage__eth num">{level} ETH</p>
                <p className="stage__line">{line(s.kind)}</p>
                <p className="stage__state num">
                  {isNow ? `Filling now: ${escrow.toFixed(4)} / ${level} ETH` : live ? "Waiting its turn." : "Starts at launch."}
                </p>
              </li>
            );
          })}
        </ol>

        <p className="sum">
          Over one full tide: <b className="num">{stepShare(steps, "feeding")}%</b> to the ten on watch, <b className="num">{stepShare(steps, "keeper")}%</b> to the treasury.
        </p>
        <p className="plain">
          No buyback and no burn: the engine never buys, sells or destroys {TICKER}.
          {treasury ? (
            <>
              {" "}
              Treasury wallet:{" "}
              <a href={addrUrl(treasury)} target="_blank" rel="noreferrer" className="num">
                {short(treasury)} <ArrowUpRight weight="bold" aria-hidden="true" />
              </a>
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
}
