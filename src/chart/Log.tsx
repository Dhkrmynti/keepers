/**
 * The log: every step the engine ran, newest first, each with the transaction that proves it. Kept
 * after dark: night falls over the chart as you reach it, and the entries are written down a ship's
 * track.
 */
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { STEP, dateWib, demoRounds, eth, txUrl, usePoll, type RoundRow, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { useMedia } from "./Bits";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Log({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const { data: rounds } = usePoll<RoundRow[]>(live ? "/api/rounds" : null, 30000, demoRounds);
  const narrow = useMedia("(max-width: 760px)");
  const [more, setMore] = useState(false);
  const all = (rounds ?? []).filter((r) => r.stage !== "failed" && STEP[r.kind]).slice(0, 12);
  const shown = more ? all : all.slice(0, narrow ? 4 : 6);
  const t = status?.totals;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the track is drawn down the log as it is read; each entry is written in when the track reaches it
      gsap.fromTo(".log__track path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".log__entries", start: "top 75%", end: "bottom 55%", scrub: 0.5 } });
      gsap.utils.toArray<HTMLElement>(".logentry").forEach((el) => gsap.from(el, { opacity: 0, x: 24, duration: 0.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 82%" } }));
    },
    { scope: root, dependencies: [shown.length] },
  );

  return (
    <section className="sec log" id="log" ref={root} aria-labelledby="log-head">
      <div className="wrap">
        <h2 className="h2" id="log-head">
          The log
        </h2>
        <p className="totals">
          <span>
            <b className="num">{eth(t?.fedETH ?? "0")}</b> paid to the ten on watch
          </span>
          <span>
            <b className="num">{eth(t?.keeperETH ?? "0")}</b> to the treasury
          </span>
        </p>
        {shown.length ? (
          <div className="log__body">
            <svg className="log__track" viewBox="0 0 20 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M10 0 V100" pathLength={1} vectorEffect="non-scaling-stroke" />
            </svg>
            <ol className="log__entries">
              {shown.map((r) => {
                const done = r.stage === "done";
                const what = r.kind === "feeding" ? `paid to ${r.recipients || 10} keepers` : "to the treasury wallet";
                const value = r.kind === "feeding" && done ? r.fedETH : r.spentETH;
                const tx = r.kind === "feeding" ? r.claimTx : r.treasuryTx;
                return (
                  <li key={r.n} className={`logentry is-${r.kind} ${done ? "" : "is-open"}`}>
                    <span className="logentry__n num">#{r.n}</span>
                    <span className="logentry__what">
                      <b>{STEP[r.kind].name}</b> {what}
                    </span>
                    <span className="logentry__eth num">{parseFloat(value).toFixed(4)} ETH</span>
                    <span className="logentry__when num">{dateWib(r.at)}</span>
                    {done && tx ? (
                      <a className="logentry__tx num" href={txUrl(tx)} target="_blank" rel="noreferrer">
                        {tx.slice(0, 8)}… <ArrowUpRight weight="bold" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="logentry__tx is-pending num">pending</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <p className="log__empty">Nothing in the log yet. The first reward runs when the creator fees reach {status?.cycle.steps[0].thresholdETH ?? "0.02"} ETH.</p>
        )}
        {all.length > shown.length ? (
          <button type="button" className="btn is-line log__more" onClick={() => setMore(true)}>
            Show {all.length - shown.length} earlier
          </button>
        ) : null}
      </div>
    </section>
  );
}
