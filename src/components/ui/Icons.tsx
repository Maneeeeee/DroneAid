import { Activity, Battery, Plane, Radio, MapPin, Phone } from "lucide-react";

/* Every SVG fill / stroke uses a CSS-variable string so the icons re-paint
   when [data-theme] flips between light and dark. Modern browsers resolve
   var() inside SVG presentation attributes against the active theme. */

import logoImg from "../../assets/logo.png";

/* LogoMark — brand logo image */
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={logoImg}
      alt="Logo"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: "auto", maxHeight: `${size}px` }}
      className={`object-contain shrink-0 ${className}`}
    />
  );
}

export function DroneGlyph({
  size = 18,
  color = "rgb(var(--warn) / 1)",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5" cy="5" r="3" stroke={color} strokeWidth="1.5" />
      <circle cx="19" cy="5" r="3" stroke={color} strokeWidth="1.5" />
      <circle cx="5" cy="19" r="3" stroke={color} strokeWidth="1.5" />
      <circle cx="19" cy="19" r="3" stroke={color} strokeWidth="1.5" />
      <path
        d="M5 5L12 12L19 5M5 19L12 12L19 19"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <rect
        x="10"
        y="10"
        width="4"
        height="4"
        rx="0.5"
        transform="rotate(45 12 12)"
        fill={color}
      />
    </svg>
  );
}

export function HospitalGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="rgb(var(--primary) / 0.12)" />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="rgb(var(--primary) / 1)"
        strokeWidth="1.5"
        strokeOpacity="0.85"
      />
      <path
        d="M12 7v10M7 12h10"
        stroke="rgb(var(--primary) / 1)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StationGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        fill="rgb(var(--warn) / 0.14)"
      />
      <rect
        x="3"
        y="6"
        width="18"
        height="12"
        rx="2"
        stroke="rgb(var(--warn) / 1)"
        strokeOpacity="0.9"
        strokeWidth="1.4"
      />
      <path
        d="M12 3v3M12 18v3"
        stroke="rgb(var(--warn) / 1)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.6" fill="rgb(var(--warn) / 1)" />
    </svg>
  );
}

export function EmergencyGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="rgb(var(--critical) / 0.14)" />
      <circle cx="12" cy="12" r="10" stroke="rgb(var(--critical) / 1)" strokeWidth="1.6" />
      <path
        d="M12 7v5l3 2"
        stroke="rgb(var(--critical) / 1)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Re-export common lucide icons for convenience
export { Activity, Battery, Plane, Radio, MapPin, Phone };
