# Nord87q Profile Website — Ready to Deploy

This is the upgraded, self-contained profile site.

## Edit only `config.js`

You can change:
- name / accent name
- bio
- Algeria timezone/location text
- accent color
- avatar image
- badges
- social links
- background video order

The four original MP4 files are included in the project and are used as a full-screen background playlist.

## Background video + sound

There is **one sound source**: the currently playing background video.

- The website starts muted after the visitor clicks **Enter**.
- The top-right speaker button unmutes/mutes the active video's audio.
- When a video ends, the next video starts automatically.
- Videos cross-fade while the profile UI stays above them.
- There is intentionally no separate "Play music" button.

This follows modern browser autoplay rules: video playback begins after the visitor's first interaction, which makes the site reliable on phones.

## Deployment

Upload the whole folder to Vercel, GitHub Pages, Netlify, or any static host. No build step is required.

## Important

Keep these files together in the same directory as `index.html`:
- `config.js`
- `script.js`
- `style.css`
- `favicon.svg`
- all four `.mp4` files
