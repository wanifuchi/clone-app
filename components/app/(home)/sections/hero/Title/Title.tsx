"use client";

import { motion } from "motion/react";

/**
 * encryptText — 既存の hero-scraping / useSwitchingCode などから import されている
 * レガシーなテキスト暗号化ユーティリティ。
 * CLONE! のタイトル自体では使用していないが、依存先のために維持している。
 */
type Options = {
  randomizeChance?: number;
  reversed?: boolean;
};

export const encryptText = (
  text: string,
  progress: number,
  _options?: Options,
) => {
  const options = {
    randomizeChance: 0.7,
    ..._options,
  };

  const encryptionChars = "a-zA-Z0-9*=?!";
  const skipTags = ["<br class='lg-max:hidden'>", "<span>", "</span>"];

  const totalChars = text.length;
  const encryptedCount = Math.floor(totalChars * (1 - progress));

  let result = "";
  let charIndex = 1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    let shouldSkip = false;

    for (const tag of skipTags) {
      if (text.substring(i, i + tag.length) === tag) {
        result += tag;
        i += tag.length - 1;
        shouldSkip = true;
        break;
      }
    }

    if (shouldSkip) continue;

    if (char === " ") {
      result += char;
      charIndex++;
      continue;
    }

    if (
      options.reversed
        ? charIndex < encryptedCount
        : text.length - charIndex < encryptedCount
    ) {
      if (Math.random() < options.randomizeChance) {
        result += char;
      } else {
        const randomIndex = Math.floor(Math.random() * encryptionChars.length);
        result += encryptionChars[randomIndex];
      }
    } else {
      result += char;
    }

    charIndex++;
  }

  return result;
};

/**
 * HomeHeroTitle — CLONE! の巨大ワードマーク。
 *
 * デザイン方針:
 *  - Geist Sans Bold / 超タイトなトラッキング (-0.04em)
 *  - clamp で 48px → 120px の流動サイズ
 *  - 「!」はエレクトリックシアンのアクセント
 *  - ごく軽いグリッチ/分裂モーション（framer-motion）
 */
export default function HomeHeroTitle() {
  return (
    <h1
      className="relative mx-auto mb-12 lg:mb-16 text-center font-sans font-bold text-[var(--clone-text)]"
      style={{
        fontSize: "clamp(48px, 11vw, 120px)",
        letterSpacing: "-0.04em",
        lineHeight: 0.92,
      }}
    >
      <span className="relative inline-block">
        {/* 本体 */}
        <motion.span
          aria-hidden="false"
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          CLONE
          <span className="text-[var(--clone-cyan-100)]">!</span>
        </motion.span>

        {/* シアン側レイヤー（わずかに左にずれて発光するクローン） */}
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: [0, 0.6, 0.25], x: [-6, -2, -1] }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          className="absolute inset-0 z-0 text-[var(--clone-cyan-100)] mix-blend-screen pointer-events-none"
          style={{ filter: "blur(0.3px)" }}
        >
          CLONE!
        </motion.span>

        {/* パープル側レイヤー（右にずれる第二のクローン） */}
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: [0, 0.35, 0.15], x: [6, 2, 1] }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
          className="absolute inset-0 z-0 text-[var(--clone-purple-100)] mix-blend-screen pointer-events-none"
          style={{ filter: "blur(0.3px)" }}
        >
          CLONE!
        </motion.span>
      </span>
    </h1>
  );
}
