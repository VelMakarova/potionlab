# PotionLab textures and icons

Theme artwork lives in `src/assets/theme/` and wooden icons in `src/assets/icons/`.
`src/styles/decorations.css` uses the frame, parchment, wood and sign artwork.
`src/styles/components.css` sets the space reserved for the frames and defines the icons.

The frame images are sliced into nine regions with CSS `border-image`. The shop
sign has no baked-in text. The title uses the laboratory font from the Tailwind
theme.
