# RainCloud

RainCloud is a web app to share RNBO patches. Upload an exported patch, map its parameters to knobs, sliders, buttons, and meters, lay out the interface, then share it so other artists can try it instantly.

## What It Does
- Patch library with search, tag filters, and sort options (newest, popular, random) to surface interesting devices fast.
- Browser RNBO player that spins up an AudioContext, loads the selected patch, and wires UI widgets to parameters and outports.
- Layout builder powered by GridStack: drag and resize controls, pick column counts, toggle labels, and save per-patch layouts.
- Creator upload flow that captures metadata, tags, images, optional links, and auto-generates a starter UI mapping from the patch description.
- Artist pages with profile pictures plus a dedicated device page showing descriptions, tags, images, and a comment thread.
- Accounts with email verification, login/logout, password reset, and a recently played list tied to each user.
- Social features: like/favourite patches, manage your own uploads, edit metadata, delete patches you own, and view what you’ve liked.

## Tech Notes
- Frontend: React with Redux Toolkit, React Router, Tailwind, GridStack, and custom UI widgets for RNBO parameters.
- Backend: Express + MongoDB for patches, layouts, likes, comments, and user auth; JWT-based sessions stored in HttpOnly cookies.
- Email flows use Mailjet for verification and password resets. Asset uploads (patch JSON + JPG images) are validated and stored alongside patch metadata.
