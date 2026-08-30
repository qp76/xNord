# Nord87q Profile — Ready-to-deploy

A complete static personal profile website. No build step is required.

## Edit only `config.js`
- Change your name, bio and location text.
- Replace social URLs in `links`.
- Hide a social card with `enabled:false`.
- Change the feedback URL.
- Change the music source.

## Background videos
The four original MP4 files are included in this package. Their filenames are referenced from `config.js`. Keep them in the same directory as `index.html` unless you update the paths.

## Audio behavior
- **Top-right speaker:** toggles the audio track of the currently playing background video.
- **Bottom-left music button:** toggles the separate background music track.
- Enabling video sound automatically pauses music, and enabling music automatically mutes video sound, so two audio tracks never fight each other.
- Press **V** for video sound and **M** for music.
- Browsers require a user interaction before sound can start; the Enter screen handles that requirement.

## Deployment
Upload all files together to Vercel, Netlify, GitHub Pages, or any static host. Do not remove the MP4 files.
