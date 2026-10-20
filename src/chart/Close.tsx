/** The close, at night: one line, the buy, the address, and the lamp sweeping the dark. */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, XLogo } from "@phosphor-icons/react";
import { DEMO, X_URL, dexUrl, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { CHAIN, NAME, TICKER } from "../lib/brand";
import { BuyButton, CaCopy, useMedia } from "./Bits";
import { Mark } from "./Keeper";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Close({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const narrow = useMedia("(max-width: 760px)");
  const ca = DEMO ? "" : status?.tokenAddress;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // the tower rises out of the dark as the page ends; the line is set a word at a time
      gsap.from(".close__tower", { yPercent: 40, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: 0.6 } });
      gsap.from(".close__h span", { yPercent: 80, opacity: 0, duration: 0.8, ease: "expo.out", stagger: 0.09, scrollTrigger: { trigger: ".close__h", start: "top 88%" } });
    },
    { scope: root },
  );
  return (
    <footer className="sec close" id="closing" ref={root} aria-label="Closing">
      <svg className="close__tower" viewBox="0 0 600 700" aria-hidden="true">
        <g className="close__beam">
          <path d="M300 150 L-900 60 L-900 260 Z" />
          <path d="M300 150 L1500 60 L1500 260 Z" />
        </g>
        <path d="M262 186 L338 186 L362 640 L238 640 Z" className="close__body" />
        {[260, 360, 460, 560].map((y) => (
          <path key={y} d={`M${262 - (y - 186) * 0.053} ${y} L${338 + (y - 186) * 0.053} ${y} L${338 + (y + 36 - 186) * 0.053} ${y + 36} L${262 - (y + 36 - 186) * 0.053} ${y + 36} Z`} className="close__band" />
        ))}
        <rect x="248" y="172" width="104" height="16" className="close__gallery" />
        <rect x="270" y="120" width="60" height="52" className="close__glass" />
        <circle cx="300" cy="148" r="14" className="close__lamp" />
        <path d="M264 120 A 36 30 0 0 1 336 120 Z" className="close__dome" />
        <path d="M180 640 L420 640 L470 700 L130 700 Z" className="close__rock" />
      </svg>
      <div className="wrap">
        <p className="close__h">
          <span>Keep</span> <span>the</span> <span>light.</span>
        </p>
        <div className="close__acts">
          <BuyButton status={status} />
          <CaCopy status={status} compact={narrow} />
        </div>
        <nav className="close__links" aria-label="Elsewhere">
          {X_URL ? (
            <a href={X_URL} target="_blank" rel="noreferrer">
              <XLogo weight="bold" aria-hidden="true" /> {NAME} on X <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          {ca ? (
            <a href={dexUrl(ca)} target="_blank" rel="noreferrer">
              Chart <ArrowUpRight weight="bold" aria-hidden="true" />
            </a>
          ) : null}
          <a href="#orders">Standing orders</a>
          <a href="#log">The log</a>
          <a href="/terms.html">Terms</a>
          <a href="/privacy.html">Privacy</a>
        </nav>
        <p className="close__sig">
          <Mark size={22} /> {NAME} · {TICKER} · {CHAIN}
        </p>
      </div>
    </footer>
  );
}
