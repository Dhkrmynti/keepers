/**
 * The keeper's light. One tower, drawn flat in SVG, used everywhere a holder is pictured: the plate
 * on a light card, the rows of the List of Lights, the mark. Every wallet gets one generated from its
 * address; holders can paint their own.
 * Part counts must match MUGSHOT_PARTS in bot/byline.ts (the slot keys are kept for the engine).
 */
import { type CSSProperties } from "react";

export const PARTS = { fur: 5, hat: 5, acc: 6, bg: 6 } as const;
export type Traits = [fur: number, hat: number, acc: number, bg: number];

/** fur = the daymark painted on the tower, hat = the lantern, acc = what is beside it, bg = the weather. */
export const PART_NAMES = {
  fur: ["White tower", "Black bands", "Blue bands", "Spiral", "Checkered"],
  hat: ["Dome", "Cone", "Pennant", "Twin lamp", "Weathervane"],
  acc: ["Nothing", "Fog horn", "Signal flag", "Gull", "Flag + gull", "Horn + gull"],
  bg: ["Clear day", "Dawn", "Dusk", "Fog", "Night", "Chart paper"],
};

const INK = "#14181c";
const PAPER = "#fbfbf8";
const SHOAL = "#cfe3ec";
const DEPTH = "#2f6e8f";
const LAND = "#f2dfa7";
export const MAGENTA = "#c2187a";
const SKY = ["#dfecf2", "#f5ddc6", "#e6bfb2", "#e3e5e1", "#0f1f30", PAPER];
const SEA = [SHOAL, "#d7e2e2", "#c9cfd8", "#d6dcdc", "#1d3a55", SHOAL];

function fnv(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** The light a wallet gets until its owner paints one. */
export function traitsFor(addr: string): Traits {
  const h = fnv(addr.toLowerCase() + ":mugshot");
  return [h % PARTS.fur, Math.floor(h / 7) % PARTS.hat, Math.floor(h / 53) % PARTS.acc, Math.floor(h / 419) % PARTS.bg];
}

export function validTraits(t: unknown): t is Traits {
  const max = [PARTS.fur, PARTS.hat, PARTS.acc, PARTS.bg];
  return Array.isArray(t) && t.length === 4 && t.every((v, i) => Number.isInteger(v) && v >= 0 && v < max[i]);
}

/** A wallet's light: the parts it picked, else the ones its address generates. */
export function lightOf(addr: string, pp?: number[] | null): Traits {
  return validTraits(pp) ? pp : traitsFor(addr);
}

const line = { stroke: INK, strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** The tower body: 34..66 wide at the foot (y 84), 40..60 at the gallery (y 40). */
const TOWER = "M40 40 L60 40 L66 84 L34 84 Z";

function Daymark({ kind, id }: { kind: number; id: string }) {
  const clip = `url(#t-${id})`;
  return (
    <g>
      <clipPath id={`t-${id}`}>
        <path d={TOWER} />
      </clipPath>
      <path d={TOWER} fill={PAPER} />
      <g clipPath={clip} fill={kind === 2 ? DEPTH : INK}>
        {kind === 1 || kind === 2 ? [46, 60, 74].map((y) => <rect key={y} x="30" y={y} width="40" height="7" />) : null}
        {kind === 3 ? <path d="M30 52 L70 38 L70 46 L30 60 Z M30 68 L70 54 L70 62 L30 76 Z M30 84 L70 70 L70 78 L30 92 Z" /> : null}
        {kind === 4
          ? [0, 1, 2, 3, 4, 5].map((r) =>
              [0, 1, 2, 3].map((c) => ((r + c) % 2 ? <rect key={`${r}${c}`} x={34 + c * 8} y={40 + r * 7.4} width="8" height="7.4" /> : null)),
            )
          : null}
      </g>
      <path d={TOWER} fill="none" {...line} />
      <rect x="47" y="70" width="6" height="14" fill={INK} />
    </g>
  );
}

function Lantern({ kind, lit }: { kind: number; lit: boolean }) {
  const glow = lit ? MAGENTA : "#8d949a";
  const twin = kind === 3;
  const x0 = twin ? 39 : 42;
  const w = twin ? 22 : 16;
  return (
    <g>
      <rect x="36" y="36" width="28" height="4.5" fill={INK} />
      <rect x={x0} y="23" width={w} height="13" fill={PAPER} {...line} strokeWidth={1.8} />
      {twin ? (
        <>
          <circle cx="45" cy="29.5" r="3.4" fill={glow} />
          <circle cx="55" cy="29.5" r="3.4" fill={glow} />
        </>
      ) : (
        <circle cx="50" cy="29.5" r="4" fill={glow} />
      )}
      {kind === 1 ? (
        <path d={`M${x0 - 2} 23 L50 11 L${x0 + w + 2} 23 Z`} fill={INK} />
      ) : (
        <path d={`M${x0 - 1} 23 A ${w / 2 + 1} 9 0 0 1 ${x0 + w + 1} 23 Z`} fill={INK} />
      )}
      {kind === 2 ? (
        <g>
          <path d="M50 14 V3" {...line} strokeWidth={1.6} />
          <path d="M50 3.5 L60 6.5 L50 9.5 Z" fill={MAGENTA} />
        </g>
      ) : null}
      {kind === 4 ? (
        <g {...line} strokeWidth={1.6} fill="none">
          <path d="M50 14 V4" />
          <path d="M42 6 H58 M56 4 L58 6 L56 8 M43 4.5 L42 6 L43 7.5" />
        </g>
      ) : null}
    </g>
  );
}

/** The plate on a card: the tower on its rock, in its weather. `out` puts the lamp out. */
export function Portrait({ traits, size = 40, className = "", title, style, out = false }: { traits: Traits; size?: number; className?: string; title?: string; style?: CSSProperties; out?: boolean }) {
  const [daymark, lantern, extra, weather] = traits;
  const night = weather === 4;
  const id = `${traits.join("")}${out ? "o" : ""}`;
  const gull = extra === 3 || extra === 4 || extra === 5;
  const flag = extra === 2 || extra === 4;
  const horn = extra === 1 || extra === 5;
  return (
    <svg className={`portrait ${className}`} viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} style={style}>
      <rect width="100" height="100" fill={SKY[weather] ?? SKY[0]} />
      {weather === 1 ? <circle cx="80" cy="74" r="12" fill="#f2b880" /> : null}
      {weather === 2 ? <circle cx="18" cy="70" r="10" fill="#c97f74" /> : null}
      {weather === 3 ? <path d="M0 30 H100 M0 44 H100 M0 58 H100" stroke="#fbfbf8" strokeWidth="5" /> : null}
      {night ? (
        <g fill={PAPER}>
          <circle cx="16" cy="16" r="1.2" />
          <circle cx="84" cy="12" r="1.2" />
          <circle cx="76" cy="44" r="1" />
          <circle cx="12" cy="52" r="1" />
        </g>
      ) : null}
      {weather === 5 ? <path d="M0 20 C 30 14, 60 26, 100 18 M0 40 C 30 34, 60 46, 100 38 M0 60 C 30 54, 60 66, 100 58" fill="none" stroke={DEPTH} strokeOpacity="0.35" strokeWidth="1" /> : null}
      {night && !out ? <path d="M50 29.5 L0 10 L0 40 Z M50 29.5 L100 14 L100 44 Z" fill={MAGENTA} fillOpacity="0.28" /> : null}
      <rect y="82" width="100" height="18" fill={SEA[weather] ?? SHOAL} />
      <path d="M0 90 q6 -3 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke={night ? "#4d6f8c" : DEPTH} strokeOpacity="0.6" strokeWidth="1.2" />
      <path d="M22 92 L30 82 L70 82 L80 92 Z" fill={LAND} {...line} />
      {flag ? (
        <g>
          <path d="M80 82 V50" {...line} />
          <path d="M80 51 H94 V60 H80 Z" fill={DEPTH} {...line} strokeWidth={1.4} />
          <path d="M80 51 L94 60 M94 51 L80 60" stroke={PAPER} strokeWidth="1.4" />
        </g>
      ) : null}
      <Daymark kind={daymark} id={id} />
      {horn ? <path d="M64 44 L74 40 L74 50 L64 47 Z" fill={INK} /> : null}
      <Lantern kind={lantern} lit={!out} />
      {gull ? <path d="M14 30 q4 -4 8 0 q4 -4 8 0" fill="none" stroke={night ? PAPER : INK} strokeWidth="1.8" strokeLinecap="round" /> : null}
      <rect x="1" y="1" width="98" height="98" fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

/** The chart's symbol for a light: a magenta flare rising from the position dot. Drawn at the origin. */
export function Flare({ scale = 1, out = false }: { scale?: number; out?: boolean }) {
  return (
    <g transform={`scale(${scale})`}>
      <path className="flare__drop" d="M0 0 C -6 -8, -5 -19, 3 -26 C 9 -17, 7 -7, 0 0 Z" transform="rotate(18)" fill={out ? "#a7adb2" : MAGENTA} />
      <circle r="2.6" fill={INK} />
    </g>
  );
}

/** The mark: a charted light inside the chart's double rule. */
export function Mark({ size = 34, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" fill={PAPER} stroke={INK} strokeWidth="2" />
      <rect x="4.5" y="4.5" width="31" height="31" fill="none" stroke={INK} strokeWidth="1" />
      <g transform="translate(17 29) scale(0.78)">
        <Flare />
      </g>
    </svg>
  );
}
