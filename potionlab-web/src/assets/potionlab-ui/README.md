# PotionLab — wood and parchment

Copy assets beside potionlab.css, or edit the four image URLs. Apply pl-theme to the common ancestor.

- pl-frame: outer frame, padding included.
- pl-panel: block frame with translucent dark fill.
- pl-panel__title: block heading.
- pl-header: centered sign + right settings layout.
- pl-sign / pl-sign__title: decorative sign wrapper and actual HTML heading.
- pl-button: parchment button; pl-button--settings and pl-button--brew are size/layout modifiers.
- pl-button--wood: wood button; pl-button--icon: 44px square; pl-button--round: round.
- pl-select: native select; pl-field: label/select layout.
- pl-card: ingredient card wrapper; pl-card__image: your original icon; pl-card__name: HTML ingredient name; pl-card__actions: button group.
- pl-card--selected: selected outline; use aria-pressed on the actual add/toggle button when appropriate.

Use real buttons and select elements. Give icon-only buttons aria-label. Prefer native disabled; aria-disabled requires your click handlers to block the action. Keep the select associated with a label. The native expanded option menu is controlled by the OS/browser and cannot reliably reproduce the paper texture. Existing pixel-art icons are not included or replaced. Demo symbols are placeholders.

wood-frame.webp: 768x768 RGBA, 10% slices, use border-image without fill.
parchment.webp: 512x512 RGB, paper fill.
wood-surface.webp: 512x512 RGB, wood card/button fill.
shop-sign.webp: 1200x400 RGBA, ropes + paper + botanical ornaments, no baked title.

Frame and fill are separate; change border-width rather than stretching a full screenshot. Do not set overflow:hidden on the overall frame if dropdown popovers need to escape it. No functional JS or application layout is bundled. preview.html is a standalone component sample.

Asset file formats, alpha and local CSS asset paths were checked. Browser visual verification could not run in the authoring environment because Chromium process launch was blocked; inspect preview.html before integrating. Font: system Georgia/Times New Roman, no font download required.
