import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { demoPond, demoStatus, usePoll, type Pond, type Status } from "./lib/api";
import { prefersReducedMotion } from "./lib/motion";
import { restoreWallet } from "./lib/wallet";
import { Header, Border } from "./chart/Header";
import { Harbour } from "./chart/Harbour";
import { Watch } from "./chart/Watch";
import { Tide } from "./chart/Tide";
import { Orders } from "./chart/Orders";
import { Tag } from "./chart/Card";
import { Log } from "./chart/Log";
import { Close } from "./chart/Close";

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const { data: status, error } = usePoll<Status>("/api/status", 4000, demoStatus);
  const live = !!status?.tokenAddress;
  // the watch is live: a new buyer is on the List of Lights within a few seconds
  const { data: pond } = usePoll<Pond>(live ? "/api/pond?limit=50" : null, 3000, demoPond);

  // A wallet that already trusts this site shows as connected without a popup.
  useEffect(restoreWallet, []);

  // The scrubbed scenes measure where they start once; when fonts, X pictures or the live
  // board change the height above them, measure again so nothing starts in the wrong place.
  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    let t = 0;
    const again = () => {
      clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    };
    document.fonts?.ready.then(again);
    window.addEventListener("load", again);
    const watched = ["watch", "tide", "orders", "post", "log"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const heights = new Map<Element, number>();
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const h = Math.round(e.contentRect.height);
        if (heights.get(e.target) !== h) {
          heights.set(e.target, h);
          again();
        }
      }
    });
    watched.forEach((el) => ro.observe(el));
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", again);
      ro.disconnect();
    };
  }, []);

  // Smooth scroll that ScrollTrigger reads from; off for reduced motion.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    const anchors = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a || a.getAttribute("href") === "#") return;
      const el = document.querySelector(a.getAttribute("href")!);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -64 });
    };
    document.addEventListener("click", anchors);
    return () => {
      document.removeEventListener("click", anchors);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // Night falls over the chart as the log comes up: one scrubbed change of light, then it stays dark.
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: ".night", start: "top 64px", end: "bottom top", toggleClass: { targets: ".head", className: "is-night" } });
      if (prefersReducedMotion()) return;
      gsap.fromTo(".night", { "--bg": "#fbfbf8" }, { "--bg": "#0c1824", ease: "none", scrollTrigger: { trigger: ".night", start: "top 85%", end: "top 25%", scrub: 0.4 } });
      // the ink changes in one step, halfway through the dusk, so text is never grey on grey
      gsap.fromTo(
        ".night",
        { "--fg": "#14181c", "--soft": "#2a323a", "--rule": "#14181c" },
        { "--fg": "#eef3f6", "--soft": "#c3d0da", "--rule": "#3c5468", ease: "steps(1)", scrollTrigger: { trigger: ".night", start: "top 85%", end: "top 55%", scrub: true } },
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="page">
      <Header status={status} />
      <Border />
      {/* the chart stays put while you start down; the lamp's sector opens into the List of Lights */}
      <Harbour status={status} pond={pond} offline={!!error && !status} />
      <main>
        <Watch status={status} pond={pond} />
        <Tide status={status} />
        <Orders status={status} />
        <Tag live={live} />
        <div className="night">
          <Log status={status} />
          <Close status={status} />
        </div>
      </main>
    </div>
  );
}
