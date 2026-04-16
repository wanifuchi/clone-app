import { HTMLAttributes } from "react";

/**
 * CloneIcon — 抽象的な分裂アイコン。
 * 2本の縦線が重なり、片方が右にずれて複製されるモチーフで
 * 「クローン / ミラー / スプリット」を表現する。
 */
export default function CloneIcon({
  className = "w-5 h-5",
  stroke = "currentColor",
  ...attrs
}: HTMLAttributes<SVGSVGElement> & { stroke?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      {...attrs}
    >
      {/* 左の縦棒（ベース） */}
      <rect x="4" y="3" width="2.2" height="14" rx="0.4" fill={stroke} />
      {/* 右の縦棒（クローン／ずらし） */}
      <rect
        x="10"
        y="3"
        width="2.2"
        height="14"
        rx="0.4"
        fill={stroke}
        opacity="0.55"
      />
      {/* ずれを示す細い横ライン */}
      <rect x="6.2" y="9.1" width="5.6" height="1.8" fill={stroke} />
      {/* 分裂のヒント — 右端のシャープなドット */}
      <rect x="15" y="9.1" width="1.8" height="1.8" fill={stroke} />
    </svg>
  );
}
