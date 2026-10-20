/**
 * The chart's title bar: the name, the five parts of the page and the way in. On wide screens the
 * chart's latitude border runs down the left edge and a marker keeps your place on it.
 */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { XLogo } from "@phosphor-icons/react";
import { X_URL, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { NAME, TICKER } from "../lib/brand";
import { BuyButton, ConnectButton } from "./Bits";
import { Mark } from "./Keeper";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const NAV: [string, string][] = [
  ["watch", "The watch"],
  ["tide", "The tide"],
  ["orders", "Standing orders"],
  ["post", "Your post"],
  ["log", "The log"],
];

export function Header({ status }: { status: Status | null }) {
  const [on, setOn] = useState("");
  useEffect(() => {
    const st = NAV.map(([id]) => ScrollTrigger.create({ trigger: `#${id}`, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setOn(id) }));
    const top = ScrollTrigger.create({ trigger: "#top", start: "top top", end: "bottom 55%", onToggle: (s) => s.isActive && setOn("") });
    return () => [...st, top].forEach((s) => s.kill());
  }, []);
  return (
    <header className="head">
      <a className="head__brand" href="#top" aria-label={`${NAME}, back to the top`}>
        <Mark size={32} />
        <span className="head__word">{NAME}</span>
        <span className="head__tick num">{TICKER}</span>
      </a>
      <nav className="nav" aria-label="Sections">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={on === id ? "is-on" : ""} aria-current={on === id ? "location" : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <div className="head__acts">
        {X_URL ? (
          <a className="head__x" href={X_URL} target="_blank" rel="noreferrer noopener" aria-label={`${NAME} on X`} title={`${NAME} on X`}>
            <XLogo weight="bold" aria-hidden="true" />
          </a>
        ) : null}
        <ConnectButton />
        <BuyButton status={status} className="is-small" />
      </div>
    </header>
  );
}

/** The latitude border down the left edge, with a marker for how far down the chart you are. Decoration, wide screens only. */
export function Border() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = root.current!;
      gsap.to(".border__mark", { y: () => el.clientHeight - 18, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4, invalidateOnRefresh: true } });
    },
    { scope: root },
  );
  return (
    <div className="border" ref={root} aria-hidden="true">
      <i className="border__mark" />
    </div>
  );
}
