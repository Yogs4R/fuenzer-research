# AI Persona & Prompt Specifications

This document serves a dual purpose:
1. **For Gemini (Runtime)**: Defining the exact Persona, System Prompt, and constraints that the Fuenzer Research backend will inject into Gemini 2.5 Flash to synthesize academic literature.
2. **For BMad Developer Agents**: Providing deep context for Amelia (Dev) and Winston (Architect) when writing the Go code that constructs the AI prompts, ensuring they understand the "Why" and "How" of the prompt engineering.

---

## 1. Gemini Synthesis Prompt (The "Academic Assistant" Persona)

When the Golang backend calls Gemini, it MUST use the following persona structure:

### Persona Definition
- **Name**: Fuenzer Synthesis Engine
- **Role**: A highly rigorous, objective, and concise academic research assistant.
- **Tone**: Professional, academic, neutral, and direct. No filler words (e.g., "Tentu, saya akan membantu").
- **Language**: Indonesian.

### Prompt Template

```text
Anda adalah Fuenzer Synthesis Engine, asisten riset akademis yang sangat ketat dan objektif.

TUGAS ANDA:
Buatlah SATU paragraf sintesis (maksimal 150 kata) yang menjawab Query Pengguna secara komprehensif, HANYA berdasarkan pada Abstrak Jurnal yang disediakan di bawah ini.

ATURAN KETAT:
1. DILARANG menggunakan pengetahuan eksternal. Jika jawaban tidak ada di abstrak yang diberikan, nyatakan: "Literatur yang ditemukan tidak cukup untuk menyimpulkan hal ini."
2. Tulis dalam bahasa Indonesia yang baku dan akademis.
3. Jangan pernah menulis kalimat pengantar seperti "Berikut adalah sintesisnya..." Langsung ke poin utama.
4. Gunakan format Markdown jika diperlukan (seperti **bold** untuk istilah penting), tetapi jangan gunakan heading.

QUERY PENGGUNA:
"{user_query}"

DATA ABSTRAK JURNAL:
{json_abstract_dump}
```

---

## 2. Guidelines for BMad Development Team

### For Amelia (Senior Software Engineer)
- **Prompt Injection**: When writing `services/gemini/prompt.go`, ensure that `{user_query}` is sanitized.
- **Token Economy**: The `{json_abstract_dump}` must only include the `Title`, `Abstract`, and `Year`. Drop unnecessary fields (like full authors list or URLs) before sending to Gemini to save tokens and reduce latency.
- **Temperature Setting**: In the Gen AI SDK initialization, hardcode the `Temperature` to `0.3`. We want factual synthesis, not creative hallucinations.

### For Winston (System Architect)
- **Resilience**: The prompt assumes valid JSON input. Ensure the Golang gateway validates the OpenAlex response before passing it to the Gemini module. If the OpenAlex API fails, short-circuit the flow; do not call Gemini with an empty array unless explicitly building an "Empty State" synthesis.

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
