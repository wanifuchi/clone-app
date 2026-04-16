import { HTMLAttributes } from "react";

/**
 * CloneLogo — 「CLONE!」ワードマーク。
 * Geist Sans 系の超タイトなトラッキングで、シャープな矩形感を出す。
 * アイコン部分とテキスト部分を横並びにする想定。
 */
export default function CloneLogo({
  className = "",
  ...attrs
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...attrs}
      className={`inline-flex items-baseline font-sans font-bold text-[17px] leading-none tracking-[-0.04em] text-foreground select-none ${className}`}
      aria-label="CLONE!"
    >
      <span>CLONE</span>
      <span className="text-[var(--clone-cyan-100)]">!</span>
    </span>
  );
}
