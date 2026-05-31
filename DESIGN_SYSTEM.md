# Design System — NLP Flow Builder

A warm, product-grade visual language. Approachable and editorial, not corporate.

---

## Color Palette

### Semantic tokens (CSS variables)

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#fff7f2` | App background |
| `--surface` | `#ffffff` | Cards, panels |
| `--surface-2` | `#fff0e4` | Elevated surfaces, nested sections |
| `--text` | `#2a2127` | Primary text |
| `--muted` | `#75636f` | Secondary / helper text |
| `--line` | `#ebd6cc` | Borders, dividers |
| `--brand` | `#ef6c3e` | Primary action, highlights |
| `--brand-strong` | `#d35a2f` | Hover/pressed brand state |
| `--accent` | `#0f766e` | Success, confirmations, teal accents |

### Supplementary raw values

| Name | Value | Context |
|---|---|---|
| Flow canvas bg | `#fff2e8` | React Flow background |
| Flow editor shell | `#ffefe5` | Full builder shell |
| Editor pane | `#fff8f2` | Property / simulator panels |
| Input border | `#ead5c8` | Default input border |
| Input border focus | `#d35a2f` | Focus ring base color |
| Edge path | `#b78775` | Flow edge (inactive) |
| Scrollbar track | `#ffe6d8` | |
| Scrollbar thumb | `#d8a78f` | |

---

## Typography

| Role | Font | Weights |
|---|---|---|
| Body | [Manrope](https://fonts.google.com/specimen/Manrope) | 400, 500, 600, 700, 800 |
| Headings (`h1`–`h4`) | [Sora](https://fonts.google.com/specimen/Sora) | 400, 600, 700 |

- Heading `letter-spacing`: `-0.015em`
- Body antialiased via `font-smooth`

### Scale (Tailwind)

| Label | Class | Typical use |
|---|---|---|
| Page title | `text-3xl / text-4xl` | `.page-title` |
| Subtitle | `text-sm / text-base` | `.page-subtitle`, color `--muted` |
| Body | `text-sm` | Default body copy |
| Caption | `text-xs` | Metadata, timestamps |

---

## Surfaces & Elevation

| Component | Class | Shape | Shadow |
|---|---|---|---|
| Panel | `.surface-panel` | `rounded-[1.35rem]`, `backdrop-blur-sm` | `0 30px 60px -48px rgba(89,45,22,0.85)` |
| Card | `.surface-card` | `rounded-[1.35rem]` | `0 22px 44px -32px rgba(101,60,32,0.75)` |
| Flow controls / minimap | inline | `border-radius: 12px` | border `--line`, bg `rgba(255,255,255,0.92)` |

Border color is always `--line` (`#ebd6cc`) unless focused/active.

---

## Inputs

```
.input-field
  border: #ead5c8  →  focus: #d35a2f
  focus ring: ring-2 ring-[#d35a2f]/20
  border-radius: rounded-xl
  font: Manrope, text-sm
  placeholder color: text-slate-300
```

---

## Interactions & Motion

| Name | Value |
|---|---|
| Default transition | `transition-colors` |
| Fade-in | `opacity 0→1, translateY 4px→0`, `0.2s ease-in-out` |
| Pulse (slow) | `pulse 2s cubic-bezier(0.4,0,0.6,1) infinite` |
| Node active glow | `0→10px spread rgba(239,108,62,0.34)`, `1.5s ease-in-out infinite` |

---

## Border Radius

| Scale | Value | Use |
|---|---|---|
| `rounded-xl` | `12px` | Inputs, small controls |
| `rounded-[1.35rem]` | `~21.6px` | Cards, panels |
| `rounded-full` | `999px` | Scrollbar thumb, pills |

---

## Key Conventions

- **Warm neutrals over grey** — all neutral tones lean toward amber/brown, never pure grey.
- **Brand orange** (`--brand`) is used exclusively for primary CTAs and active/selected states.
- **Accent teal** (`--accent`) is reserved for positive/success states only.
- No dark mode is currently defined; the `darkMode: 'class'` config is available but unused.
