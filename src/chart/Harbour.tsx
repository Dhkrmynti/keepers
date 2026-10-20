/**
 * The opening: the chart of the coast. The ten lights along it are the live top ten: No. 1 is the
 * lamp on the headland, No. 2-5 the top watch, No. 6-10 the lower watch. The daymark inland is the
 * dev wallet: it stands on the coast but is never lit and never paid.
 * Scrolling pins the chart, closes in on the lamp, and the lamp's sector opens into the List of Lights.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "@phosphor-icons/react";
import { DEFAULT_STEPS, DEMO, STEP, compact, type Pond, type Status } from "../lib/api";
import { nameFor } from "../lib/alias";
import { prefersReducedMotion } from "../lib/motion";
import { NAME, TICKER } from "../lib/brand";
import { BuyButton } from "./Bits";
import { Flare } from "./Keeper";
import { openTag } from "./Card";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Where each rank's light stands on the chart, in the chart's 1000 by 800 box. No. 1 is the lamp on the headland. */
export const SPOTS: [number, number][] = [
  [380, 198],
  [502, 294],
  [525, 364],
  [549, 434],
  [564, 502],
  [606, 568],
  [636, 623],
  [665, 678],
  [694, 728],
  [710, 772],
];
const COAST =
  "M470 0 C430 60 350 130 366 196 C378 244 470 262 496 292 C516 316 508 340 521 362 C534 386 540 410 545 432 C552 460 552 480 560 500 C572 528 590 546 602 566 C614 586 624 604 632 621 C644 645 652 660 661 676 C672 696 682 710 690 726 C698 744 702 758 706 772 L716 800";
const LAND = `${COAST} L1000 800 L1000 0 Z`;
const SOUNDINGS: [number, number, string][] = [
  [250, 90, "34"], [330, 160, "21"], [212, 300, "47"], [300, 260, "18"], [420, 330, "12"], [260, 420, "38"], [380, 450, "16"],
  [470, 520, "9"], [300, 560, "52"], [420, 610, "23"], [520, 650, "6"], [360, 720, "44"], [480, 760, "17"], [580, 720, "4"],
  [170, 520, "61"], [440, 120, "8"], [600, 780, "3"],
];

/** The chart's notation for each light: the lamp shows isophase, the top watch flashes every 5 s, the lower every 10 s. */
export const characteristic = (rank: number) => (rank === 1 ? "Iso W 4s" : rank <= 5 ? "Fl W 5s" : "Fl W 10s");

type Light = { id: string; addr: string; name: string; balance: string };

export function Harbour({ status, pond, offline }: { status: Status | null; pond: Pond | null; offline: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const live = !!status?.tokenAddress;
  const top = live ? (pond?.rows ?? []).slice(0, 10) : [];
  const lights: Light[] = useMemo(() => top.map((r) => ({ id: r.addr.toLowerCase(), addr: r.addr, name: nameFor(r.addr, r.nickname, r.x).name, balance: r.balance })), [pond, live]);
  const house = live ? pond?.house : null;
  // the token is live but the board has not arrived yet: say nothing about unlit lights until it has
  const empty = lights.length === 0 && !(live && !pond);

  // everyone the engine ever reported as sold stays in the set, so a late board update still puts out the right light
  const soldSet = useRef(new Set<string>());
  for (const a of pond?.sold ?? []) soldSet.current.add(a.toLowerCase());
  for (const o of pond?.out ?? []) soldSet.current.add(o.addr.toLowerCase());

  // a keeper who sold and dropped out of the ten gets one last moment: the light goes out where it stood
  const prev = useRef<{ light: Light; at: number }[]>([]);
  const [goingOut, setGoingOut] = useState<{ light: Light; at: number }[]>([]);
  const alive = useRef(true);
  useEffect(() => () => void (alive.current = false), []);
  useEffect(() => {
    const now = new Set(lights.map((r) => r.id));
    const gone = prev.current.filter((p) => !now.has(p.light.id) && soldSet.current.has(p.light.id));
    prev.current = lights.map((light, at) => ({ light, at }));
    if (!gone.length) return;
    setGoingOut((l) => [...l, ...gone]);
    window.setTimeout(() => alive.current && setGoingOut((l) => l.filter((x) => !gone.includes(x))), 2200);
  }, [lights]);

  const steps = status?.cycle.steps ?? DEFAULT_STEPS;
  const next = status ? steps[status.cycle.index] ?? steps[0] : steps[0];
  const escrow = live ? parseFloat(status?.escrowETH ?? "0") : 0;
  const target = parseFloat(next.thresholdETH);
  const pct = target > 0 ? Math.max(0, Math.min(1, escrow / target)) : 0;

  // When ranks move, each keeper's light travels down the coast to its new place (FLIP, keyed by
  // wallet). Measured by offset inside the chart, never on screen, so scrolling is not read as a move.
  const last = useRef(new Map<string, { x: number; y: number; w: number }>());
  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const now = new Map<string, { x: number; y: number; w: number }>();
    const w = el.querySelector<HTMLElement>(".lights")?.offsetWidth ?? 0;
    el.querySelectorAll<HTMLElement>(".light[data-key]").forEach((n) => {
      const b = { x: n.offsetLeft, y: n.offsetTop, w };
      now.set(n.dataset.key!, b);
      const a = last.current.get(n.dataset.key!);
      if (!a || a.w !== b.w || prefersReducedMotion() || (Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2)) return;
      gsap.fromTo(n, { x: a.x - b.x, y: a.y - b.y }, { x: 0, y: 0, duration: 1.6, ease: "power2.inOut", clearProps: "transform" });
    });
    last.current = now;
  });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // arriving: the chart is drawn, depth by depth, then the cartouche is lettered
      gsap
        .timeline({ delay: 0.05 })
        .from(".chart__contour", { strokeDashoffset: 1, duration: 1.4, ease: "power2.out", stagger: 0.12 })
        .from(".chart__coast", { strokeDashoffset: 1, duration: 1.6, ease: "power2.inOut" }, 0)
        .from(".chart__land", { opacity: 0, duration: 0.8, ease: "power1.out" }, 0.7)
        .from(".chart__lettering > *", { opacity: 0, duration: 0.6, stagger: 0.04 }, 0.9)
        .from(".cartouche > *", { y: 18, opacity: 0, duration: 0.55, ease: "power3.out", stagger: 0.07 }, 0.2);

      // leaving, on wide screens: the chart closes in on the lamp and its light sector opens into the next page
      const mm = gsap.matchMedia();
      mm.add("(min-width: 861px)", () => {
        const lampAt = () => {
          const box = wrap.current!.querySelector<HTMLElement>(".chartbox")!.getBoundingClientRect();
          const scene = wrap.current!.querySelector<HTMLElement>(".harbour")!.getBoundingClientRect();
          return { x: box.left - scene.left + (box.width * SPOTS[0][0]) / 1000, y: box.top - scene.top + (box.height * SPOTS[0][1]) / 800 };
        };
        gsap.set(".chartbox", { transformOrigin: `${SPOTS[0][0] / 10}% ${SPOTS[0][1] / 8}%` });
        gsap
          .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: wrap.current, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true } })
          .to(".chartbox", { scale: 1.7, duration: 0.45 }, 0)
          .to(".seascape", { scale: 1.25, opacity: 0.4, duration: 0.45 }, 0)
          .to(".cartouche", { yPercent: -18, opacity: 0, duration: 0.2 }, 0)
          .fromTo(
            ".opening",
            { clipPath: () => `circle(0px at ${lampAt().x}px ${lampAt().y}px)` },
            { clipPath: () => `circle(${Math.hypot(window.innerWidth, window.innerHeight) * 1.05}px at ${lampAt().x}px ${lampAt().y}px)`, duration: 0.35 },
            0.1,
          )
          // the List of Lights has been rising under the chart since the start (see .watch in chart.css):
          // its heading and the lamp are lettered in only once the sector has opened
          .fromTo(document.querySelectorAll("#watch .watch__head, #watch .lamp"), { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.47)
          .to({}, { duration: 0.43 }, 0.57);
      });
    },
    { scope: wrap },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion() || !lights.length) return;
      // the lights come on from the lower watch up to the lamp
      gsap.from(".light:not(.is-unlit)", { opacity: 0, scale: 0.4, transformOrigin: "0 0", duration: 0.5, ease: "back.out(2.2)", stagger: { each: 0.07, from: "end" }, delay: performance.now() < 1800 ? 1.2 : 0.05 });
    },
    { scope: wrap, dependencies: [lights.length > 0] },
  );

  const at = (i: number) => ({ left: `${SPOTS[i][0] / 10}%`, top: `${SPOTS[i][1] / 8}%` });

  return (
    <div className="harbourwrap" ref={wrap}>
      <section className="harbour" id="top" aria-label={`${NAME}: the chart`}>
        <svg className="seascape" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5, 6].map((k) => (
            <path key={k} d={`M-20 ${140 + k * 118} C 300 ${100 + k * 118}, 520 ${190 + k * 118}, 900 ${130 + k * 118}`} fill="none" stroke="#9cc0d1" strokeWidth="1" strokeDasharray={k % 2 ? "6 5" : undefined} />
          ))}
        </svg>

        <div className="chartbox">
          <svg className="chart" viewBox="0 0 1000 800" aria-hidden="true">
            <path d={LAND} transform="translate(-150 0)" fill="#e7f1f5" />
            <path d={LAND} transform="translate(-70 0)" fill="#cfe3ec" />
            {[-70, -150, -230, -320].map((dx, i) => (
              <path key={dx} className="chart__contour" d={COAST} transform={`translate(${dx} 0)`} pathLength={1} fill="none" stroke="#8db4c6" strokeWidth="1" strokeDasharray={i > 1 ? "0.012 0.008" : "1 1"} />
            ))}
            <path className="chart__land" d={LAND} fill="#f2dfa7" />
            <path className="chart__coast" d={COAST} pathLength={1} fill="none" stroke="#14181c" strokeWidth="2.2" strokeDasharray="1 1" />
            <g className="chart__lettering">
              {SOUNDINGS.map(([x, y, n]) => (
                <text key={`${x}-${y}`} x={x} y={y} className="chart__sounding">
                  {n}
                </text>
              ))}
              <text x="160" y="380" className="chart__water">
                Robinhood Chain Sound
              </text>
              <text x="330" y="690" className="chart__water is-small">
                Pons Roads
              </text>
              <text x="440" y="110" className="chart__place">
                Hold Fast Point
              </text>
              <text x="780" y="330" className="chart__place is-small">
                The Dunes
              </text>
              <text x="760" y="520" className="chart__place is-small">
                Never Sold Heath
              </text>
              <g transform="translate(860 640) rotate(-12)" className="chart__hatch">
                {[0, 1, 2, 3, 4].map((k) => (
                  <path key={k} d={`M${-50 + k * 10} 30 L${-10 + k * 10} -30`} />
                ))}
              </g>
            </g>
            <g className="rose" transform="translate(250 600)">
              <circle r="86" fill="none" stroke="#14181c" strokeWidth="1" />
              <circle r="66" fill="none" stroke="#14181c" strokeWidth="1.4" />
              <circle r="54" fill="none" stroke="#14181c" strokeWidth="0.8" strokeDasharray="2 3" />
              <g className="rose__card">
                <path d="M0 -104 L11 -11 L104 0 L11 11 L0 104 L-11 11 L-104 0 L-11 -11 Z" fill="#fbfbf8" stroke="#14181c" strokeWidth="1.4" />
                <path d="M0 -104 L11 -11 L-11 -11 Z" fill="#c2187a" />
                <path d="M0 104 L11 11 L-11 11 Z M104 0 L11 11 L11 -11 Z" fill="#14181c" />
              </g>
              <circle r="3" fill="#14181c" />
              <text y="-112" className="rose__n">
                N
              </text>
            </g>
            {/* the lamp's light sector: it sweeps the sea while the chart is open */}
            <g transform={`translate(${SPOTS[0][0]} ${SPOTS[0][1]})`}>
              <circle r="96" fill="none" stroke="#c2187a" strokeWidth="1.4" strokeDasharray="5 4" />
              <g className="sector">
                <path d="M0 0 L-420 -120 A 436 436 0 0 0 -400 170 Z" fill="#c2187a" fillOpacity="0.13" />
                <path d="M0 0 L-420 -120 M0 0 L-400 170" stroke="#c2187a" strokeWidth="1" strokeDasharray="6 5" fill="none" />
              </g>
            </g>
          </svg>

          <ol className="lights" aria-label="The ten on watch">
            {SPOTS.map((_, i) => {
              const l = lights[i];
              const tier = i === 0 ? "is-lamp" : i < 5 ? "is-top" : "is-low";
              const style = { ...at(i), "--period": i === 0 ? "4s" : i < 5 ? "5s" : "10s", "--phase": `${-(i * 1.37).toFixed(2)}s` } as CSSProperties;
              return l ? (
                <li key={l.id} data-key={l.id} className={`light ${tier}`} style={style}>
                  <button type="button" onClick={() => openTag(l.addr)} aria-label={`No. ${i + 1}, ${l.name}. Open the light card`}>
                    <svg className="light__flare" viewBox="-20 -34 40 40" aria-hidden="true">
                      <Flare scale={i === 0 ? 1.25 : 1} />
                    </svg>
                    <span className="light__tag">
                      <b>No. {i + 1}</b>
                      <span className="light__name">{l.name}</span>
                      <span className="light__ch">
                        {characteristic(i + 1)} · {compact(l.balance)}
                      </span>
                    </span>
                  </button>
                </li>
              ) : (
                <li key={`unlit-${i}`} className={`light ${tier} is-unlit`} style={style}>
                  <svg className="light__flare" viewBox="-20 -34 40 40" aria-hidden="true">
                    <Flare out />
                  </svg>
                  <span className="light__tag">
                    <b>No. {i + 1}</b>
                    <span className="light__name">unlit</span>
                  </span>
                </li>
              );
            })}
            {goingOut.map(({ light, at: i }) => (
              <li key={`out-${light.id}`} className="light is-going" style={at(Math.min(i, 9))} aria-hidden="true">
                <svg className="light__flare" viewBox="-20 -34 40 40">
                  <Flare out />
                </svg>
                <span className="light__tag">
                  <span className="light__name">{light.name}</span>
                  <span className="light__ch">left the post</span>
                </span>
              </li>
            ))}
          </ol>

          {house ? (
            <button type="button" className="daymark" onClick={() => openTag(house.addr)} aria-label={`The daymark, ${nameFor(house.addr, house.nickname, house.x).name}. Open the light card`}>
              <svg viewBox="0 0 40 56" aria-hidden="true">
                <path d="M20 4 L32 22 L8 22 Z" fill="#14181c" />
                <path d="M20 22 V52 M12 52 H28" stroke="#14181c" strokeWidth="3" strokeLinecap="square" />
              </svg>
              <span className="daymark__tag">
                <b>The daymark</b>
                <span>{nameFor(house.addr, house.nickname, house.x).name}</span>
              </span>
            </button>
          ) : null}
        </div>

        <div className="cartouche">
          <h1 className="cartouche__name">{NAME}</h1>
          <p className="cartouche__motto">{empty ? "Ten lights, all unlit." : "Keep the light."}</p>
          <p className="cartouche__rule">
            {offline
              ? "The chart is offline for a moment."
              : empty
                ? live
                  ? `The first holder of 100,000 ${TICKER} takes the lamp.`
                  : `Opens at launch. The first holder of 100,000 ${TICKER} takes the lamp.`
                : `The ten biggest holders of ${TICKER} keep the light and are paid in ETH from trading fees. Leave your post once and the light is out for you.`}
            {DEMO ? <em className="demo"> Demo data.</em> : null}
          </p>
          <div className="gauge" role="status">
            <span className="gauge__k">
              Tide rising to <b>{STEP[next.kind].name}</b>
            </span>
            <span className="gauge__staff" role="meter" aria-valuemin={0} aria-valuemax={target} aria-valuenow={escrow} aria-label={`Fees collected toward the next ${STEP[next.kind].name.toLowerCase()}`}>
              {Array.from({ length: 20 }, (_, k) => (
                <i key={k} className={(k + 1) / 20 <= pct + 0.0001 ? "is-wet" : ""} />
              ))}
            </span>
            <span className="gauge__read num">
              {escrow.toFixed(4)} / {next.thresholdETH} ETH
            </span>
          </div>
          <div className="cartouche__acts">
            <BuyButton status={status} />
            <a className="btn is-line" href="#watch">
              <span className="btn__long">See the watch</span>
              <span className="btn__short">The watch</span> <ArrowDown weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="opening" aria-hidden="true" />
      </section>
    </div>
  );
}
