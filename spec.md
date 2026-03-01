# Specification

## Summary
**Goal:** Darken the app's color theme and update the owner PIN code to `18215`.

**Planned changes:**
- Adjust CSS custom property palette in `frontend/src/index.css` to darken background, surface, card, and sidebar tokens while preserving the warm earthy palette direction, for both light and dark theme variants
- Update the owner PIN validation in the backend Motoko actor to accept `18215` as the correct PIN

**User-visible outcome:** The app appears noticeably darker overall while retaining its warm earthy style, and the owner PIN prompt accepts `18215` for authentication.
