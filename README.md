# Pips (NYT-style remake)

A polished browser puzzle inspired by The New York Times games look-and-feel, with:

- **Daily mode** (same seed for everyone each day)
- **Endless mode** (unlimited generated puzzles)
- Seed loading for replay/share
- Timer, mistakes counter, streak, and board check

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## How to play

- Click/tap a square to cycle: empty → pip → X.
- Row and column clues show contiguous pip runs (example: `2 1` means a run of 2 and a run of 1).
- Match all clues to solve.

## Notes

- This is an independent NYT-style remake, not an official NYT product.
