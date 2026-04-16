# CLONE!

> **Mirror any website into code.** — どんなサイトも、一瞬でコードに。

**CLONE!** は URL を 1 本投げ込むだけで、そのサイトを解析し React (Next.js) コンポーネントとして再構築してしまう AI ツールです。デザインの雰囲気を借りたいとき、既存ブランドを新しい機能で拡張したいとき、あるいはただ「このサイト、どう作ってるんだろう」と思ったとき — CLONE! がその瞬間にコードに変換します。

---

## Features

- **Instant clone** — URL を貼るだけで、AI がスクリーンショットと構造を読み、React コードを生成。
- **Brand extension mode** — 既存サイトのブランドスタイルだけを抽出して、全く新しい画面に再利用。
- **Multi-model** — OpenAI / Anthropic / Gemini / Groq を切り替え可能。
- **Sandboxed preview** — Vercel Sandbox または E2B 上で即プレビュー。
- **Dark, electric** — Linear / Vercel / Raycast の空気感を吸ったダークファーストな UI。

## Setup

1. **Install**

```bash
pnpm install  # or npm install / yarn install
```

2. **Create `.env.local`**

```env
# Required — website scraping
FIRECRAWL_API_KEY=your_firecrawl_api_key    # https://firecrawl.dev

# AI provider — choose at least one
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key

# Optional — faster edits
MORPH_API_KEY=your_morphllm_api_key

# Sandbox provider — vercel (default) or e2b
SANDBOX_PROVIDER=vercel
VERCEL_OIDC_TOKEN=auto_generated_by_vercel_env_pull
# E2B_API_KEY=your_e2b_api_key
```

3. **Run**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and paste any URL.

## Stack

Next.js 16 · React 19 · Tailwind CSS · framer-motion · Firecrawl SDK · Vercel Sandbox / E2B · AI SDK (OpenAI / Anthropic / Google / Groq)

## License

MIT

---

<sub>Based on [open-lovable](https://github.com/mendableai/open-lovable) by Firecrawl (MIT). CLONE! is an independent rebrand and UI overhaul.</sub>
