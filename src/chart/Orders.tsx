/**
 * The rules, as four standing orders posted at the light, and the count of keepers who left their
 * post so far. Each order is lit by the lamp's sweep as it comes into view.
 */
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { amount, type Status } from "../lib/api";
import { prefersReducedMotion } from "../lib/motion";
import { TICKER } from "../lib/brand";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Orders({ status }: { status: Status | null }) {
  const root = useRef<HTMLElement>(null);
  const min = amount(status?.rules.minBalance ?? "100000");
  const out = status?.tokenAddress ? status.counts.hopped : 0;
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".order").forEach((el) =>
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 82%" } })
          .from(el.querySelector(".order__text"), { yPercent: 40, opacity: 0, duration: 0.7, ease: "expo.out" })
          .fromTo(el.querySelector(".order__beam"), { xPercent: -105, opacity: 1 }, { xPercent: 105, duration: 0.9, ease: "power2.inOut" }, 0.1),
      );
      gsap.from(".orders__out", { y: 20, opacity: 0, duration: 0.7, ease: "expo.out", scrollTrigger: { trigger: ".orders__out", start: "top 92%" } });
    },
    { scope: root },
  );
  return (
    <section className="sec orders" id="orders" ref={root} aria-labelledby="orders-head">
      <div className="wrap">
        <h2 className="h2" id="orders-head">
          Standing orders
        </h2>
        <ol className="orders__list">
          <li className="order">
            <i className="order__beam" aria-hidden="true" />
            <p className="order__text">
              <b>
                Hold {min} {TICKER}
              </b>{" "}
              to sign on at the light.
            </p>
          </li>
          <li className="order">
            <i className="order__beam" aria-hidden="true" />
            <p className="order__text">
              <b>The biggest holder</b> keeps the lamp.
            </p>
          </li>
          <li className="order">
            <i className="order__beam" aria-hidden="true" />
            <p className="order__text">
              <b>The ten on watch</b> share every reward, in ETH.
            </p>
          </li>
          <li className="order is-out">
            <i className="order__beam" aria-hidden="true" />
            <p className="order__text">
              <b>Never leave your post.</b> Sell once and the light is out for you. For good.
            </p>
          </li>
        </ol>
        <p className="orders__out">
          <b className="num">{out}</b> have left their post so far. Moving between your own wallets is not leaving.
        </p>
      </div>
    </section>
  );
}
