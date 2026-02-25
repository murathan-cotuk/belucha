# Belucha Design System — Premium Marketplace

Amazon kadar güven veren, Zalando kadar temiz, daha premium his. Turuncu sadece aksiyon rengi.

---

## 📁 Cursor’a verilecek dosya yolları

| Amaç | Yol |
|------|-----|
| **Design token dosyası** | `apps/shop/src/design-system/tokens.js` |
| **Typography dosyası** | `apps/shop/src/design-system/typography.js` |
| **Button component** | `apps/shop/src/components/ui/Button.jsx` |
| **Navbar component** | `apps/shop/src/components/ShopHeader.jsx` |
| **Global CSS** | `apps/shop/src/app/globals.css` |
| **Tailwind theme (renk/spacing/radius/shadow)** | `apps/shop/tailwind.config.js` (theme.extend) |

---

## Kullanım

- **Styled-components:** `import { tokens } from '@/design-system/tokens'`
- **Tailwind:** Semantic class’lar: `text-primary`, `bg-background-soft`, `border-border-light`, `rounded-card`, `shadow-card`, `text-h1`, `text-body`, `text-dark-800`, spacing: `p-md`, `gap-lg` vb.
- **CSS değişkenleri:** `globals.css` içindeki `:root` (örn. `var(--color-primary)`).

Yeni component’lerde hardcoded renk/spacing kullanma; token veya Tailwind theme’den besle.
