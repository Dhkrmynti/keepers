/**
 * The watch: the same ten wallets that stand as lights on the chart above, printed as the List of
 * Lights. No. 1 keeps the lamp; No. 1-5 are the top watch and No. 6-10 the lower watch (the two
 * reward tiers); 11-50 are on the approach, dashed until they come on watch. When ranks move, entries
 * glide to their new lines.
 */
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { DEFAULT_TIERS, compact, splitInheritance, usd, type Pond, type PondRow, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";
import { Face, XCheck, XLink } from "./Bits";
import { openTag } from "./Card";
import { characteristic } from "./Harbour";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Who({ addr, nickname, pp, x, size = 28 }: { addr: string; nickname?: string; pp?: number[] | null; x?: PondRow["x"]; size?: number }) {
  const who = nameFor(addr, nickname, x ?? null);
  return (
    <span className="who">
      {size > 0 ? <Face addr={addr} pp={pp ?? null} x={x ?? null} size={size} className="who__face" /> : null}
      {x ? <XLink x={x} className="who__x" /> : null}
      <button type="button" className="who__name" onClick={() => openTag(addr)} aria-label={`Open the light card of ${who.name}`}>
        {who.name}
      </button>
      {x ? <XCheck x={x} /> : null}
    </span>
  );
}

export function Watch({ status, pond }: { status: Status | null; pond: Pond | null }) {
  const root = useRef<HTMLElement>(null);
  const live = !!status?.tokenAddress;
  const rows = live ? (pond?.rows ?? []).slice(0, 50) : [];
  const tiers = status?.rules.tiers ?? DEFAULT_TIERS;
  const reward = parseFloat(status?.cycle.steps.find((s) => s.kind === "feeding")?.thresholdETH ?? "0.02");
  const share = splitInheritance(reward, rows.filter((r) => r.inTop).map((r) => parseFloat(r.balance)), tiers);
  const px = status?.price?.tokenUSD ?? 0;
  const worth = (b: string) => (px > 0 ? usd(parseFloat(b) * px) : "");
  const bar = rows.length >= 10 ? parseFloat(rows[9].balance) : 0;
  const ten = Array.from({ length: 10 }, (_, i) => rows[i]);
  const far = rows.slice(10);
  const one = ten[0];

  // Entries glide to their new lines when ranks move (FLIP, keyed by wallet). Offsets ignore
  // transforms and scrolling, so only a real change of place is animated; a change of width is not.
  const last = useRef(new Map<string, { x: number; y: number; w: number }>());
  const prevOne = useRef<string | undefined>(undefined);
  const [taken, setTaken] = useState(0);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const w = el.offsetWidth;
    const now = new Map<string, { x: number; y: number; w: number }>();
    el.querySelectorAll<HTMLElement>("[data-key]").forEach((n) => now.set(n.dataset.key!, { x: n.offsetLeft, y: n.offsetTop, w }));
    if (!prefersReducedMotion())
      el.querySelectorAll<HTMLElement>("[data-key]").forEach((n) => {
        const a = last.current.get(n.dataset.key!);
        const b = now.get(n.dataset.key!);
        if (!a || !b || a.w !== b.w || (Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2)) return;
        gsap.fromTo(n, { x: a.x - b.x, y: a.y - b.y, zIndex: 3 }, { x: 0, y: 0, duration: 1.1, ease: "power2.inOut", clearProps: "transform,zIndex" });
      });
    last.current = now;
    const k = rows[0]?.addr;
    if (prevOne.current && k && k !== prevOne.current) setTaken((s) => s + 1);
    prevOne.current = k;
  });

  // the lamp has a new keeper: say so once
  useGSAP(
    () => {
      if (!taken || prefersReducedMotion()) return;
      gsap.fromTo(".taken", { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
      gsap.to(".taken", { opacity: 0, delay: 2.6, duration: 0.4 });
    },
    { scope: root, dependencies: [taken] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the entries are printed down the page as it comes into view; the lamp's beam passes over its own
      gsap.from(".entry", { clipPath: "inset(0 100% 0 0)", duration: 0.8, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: ".roll", start: "top 80%" } });
      gsap.fromTo(".lamp__sweep", { xPercent: -100, opacity: 1 }, { xPercent: 100, duration: 1.4, ease: "power2.inOut", scrollTrigger: { trigger: ".lamp", start: "top 75%" } });
      gsap.from(".approach li", { opacity: 0, y: 10, duration: 0.4, ease: "power2.out", stagger: 0.015, scrollTrigger: { trigger: ".approach", start: "top 85%" } });
    },
    { scope: root, dependencies: [rows.length > 0] },
  );

  const entry = (r: PondRow | undefined, rank: number) => (
    <li key={r?.addr ?? `unlit-${rank}`} data-key={r?.addr} className={`entry ${r ? "" : "is-unlit"}`}>
      <span className="entry__n num">{rank}</span>
      {r ? (
        <>
          <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={36} />
          <span className="entry__ch num">{characteristic(rank)}</span>
          <span className="entry__bal num">
            {compact(r.balance)}
            {worth(r.balance) ? <small> {worth(r.balance)}</small> : null}
          </span>
          <span className="entry__next num">+{(share[rank - 1] ?? 0).toFixed(4)}</span>
        </>
      ) : (
        <span className="entry__unlit">Unlit. {bar > 0 ? "Hold more than No. 10 to light it." : `Hold 100,000 ${TICKER} to light it.`}</span>
      )}
    </li>
  );

  return (
    <section className="sec watch" id="watch" ref={root} aria-labelledby="watch-head">
      <div className="wrap">
        <header className="watch__head">
          <h2 className="h2" id="watch-head">
            The List of Lights
          </h2>
          <p className="deck">
            {live ? `${(pond?.total ?? 0).toLocaleString("en-US")} holders on the coast.` : "Opens at launch."}
            {px > 0 ? ` 1 ${TICKER} is about $${px < 0.01 ? px.toPrecision(3) : px.toFixed(4)}.` : ""}
          </p>
        </header>

        <div className={`lamp ${one ? "" : "is-unlit"}`} data-key={one?.addr}>
          <i className="lamp__sweep" aria-hidden="true" />
          <p className="lamp__k">
            <b className="num">No. 1</b> keeps the lamp
          </p>
          {one ? (
            <>
              <Who addr={one.addr} nickname={one.nickname} pp={one.pp} x={one.x} size={96} />
              <dl className="lamp__facts">
                <div>
                  <dt>Light</dt>
                  <dd className="num">{characteristic(1)}</dd>
                </div>
                <div>
                  <dt>Holding</dt>
                  <dd className="num">
                    {compact(one.balance)} {TICKER}
                    {worth(one.balance) ? <small> {worth(one.balance)}</small> : null}
                  </dd>
                </div>
                <div>
                  <dt>Next reward</dt>
                  <dd className="num is-mag">+{(share[0] ?? 0).toFixed(4)} ETH</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="lamp__none">Nobody yet. The biggest holder takes it.</p>
          )}
        </div>

        <div className="roll">
          <div className="roll__cols num" aria-hidden="true">
            <span>No.</span>
            <span>Keeper</span>
            <span>Light</span>
            <span>Holding</span>
            <span>Next, ETH</span>
          </div>
          <div className="roll__group">
            <h3 className="roll__k">
              <b>Top watch.</b> No. 1-5 share {tiers[0]?.eth ?? "0.014"} ETH of every {reward} ETH reward.
            </h3>
            <ol className="roll__list">{ten.slice(1, 5).map((r, i) => entry(r, i + 2))}</ol>
          </div>
          <div className="roll__group">
            <h3 className="roll__k">
              <b>Lower watch.</b> No. 6-10 share {tiers[1]?.eth ?? "0.006"} ETH.
            </h3>
            <ol className="roll__list">{ten.slice(5).map((r, i) => entry(r, i + 6))}</ol>
          </div>
        </div>

        {live && (pond?.house || pond?.waiting?.length || pond?.out?.length) ? (
          <div className="notices">
            {pond?.house ? (
              <p className="notice">
                <b>The daymark</b>
                <Who addr={pond.house.addr} nickname={pond.house.nickname} pp={pond.house.pp} x={pond.house.x} size={24} />
                <span>
                  <span className="num">{compact(pond.house.balance)}</span>. The dev wallet: stands on the coast, never lit, never paid.
                </span>
              </p>
            ) : null}
            {pond?.waiting?.length ? (
              <p className="notice">
                <b>Signing on</b>
                {pond.waiting.map((w) => (
                  <Who key={w.addr} addr={w.addr} nickname={w.nickname} pp={w.pp} x={w.x} size={22} />
                ))}
              </p>
            ) : null}
            {pond?.out?.length ? (
              <p className="notice is-out">
                <b>Left the post</b>
                {pond.out.map((w) => (
                  <span key={w.addr} className="notice__gone">
                    {nameFor(w.addr, w.nickname, w.x).name}
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        ) : null}

        {far.length ? (
          <div className="approach">
            <h3 className="h3">On the approach</h3>
            <ol start={11} aria-label="No. 11 to 50">
              {far.map((r) => {
                const gap = bar - parseFloat(r.balance);
                return (
                  <li key={r.addr} data-key={r.addr}>
                    <span className="approach__n num">{r.rank}</span>
                    <Who addr={r.addr} nickname={r.nickname} pp={r.pp} x={r.x} size={22} />
                    <span className="approach__sub num">
                      {compact(r.balance)} · {gap > 0 ? `+${compact(gap + 1)} to the watch` : "next on watch"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : null}
        {taken ? (
          <p className="taken" aria-live="polite">
            The lamp has a new keeper.
          </p>
        ) : null}
      </div>
    </section>
  );
}
