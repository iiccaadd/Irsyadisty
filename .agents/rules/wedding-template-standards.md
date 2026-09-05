# Wedding Invitation Template Standards & Guardrails

## 1. Zero Third-Party Watermark / Branding Invariant
When building, adapting, or replicating digital wedding invitations based on external design references (such as `envelope.id`, `viding.co`, `nikahankami`, etc.):
- **Strictly No Third-Party Watermarks**: Never include logos, text watermarks, copyright notices, tracking scripts, or links belonging to the original agency/platform (`envelope.id` or similar).
- **Couple & White-label Branding**: Default all brand labels and watermarks to the wedding couple (e.g., "The Wedding of Irsyad & Adisty") and ensure branding can be customized via the Admin Studio.

## 2. Temporal Dead Zone (TDZ) Elimination
- In all frontend scripts (e.g. `invitation.js`, `admin.js`), declare all state variables (`let`, `const`) at the absolute beginning of the enclosing scope (`DOMContentLoaded`) before any functions or setup routines are invoked.
- Avoid calling hoisted functions that reference `let` or `const` variables positioned lexically below their invocation.

## 3. Sora (Royal) Luxury Layout Architecture
- **Desktop Split-Screen (>= 1024px)**: Left column fixed 100vh hero banner with couple portrait, high-contrast serif typography ("THE WEDDING OF"), couple names, wedding date, and verse. Right column (480px–540px) is the scrollable invitation container.
- **Mobile First (< 1024px)**: Full-screen opening cover card with recipient name, "Buka Undangan" button, smooth fade-out unlock animation, background music autoplay, and floating bottom navigation.
