# Infinite Pips

A lightweight browser puzzle inspired by NYT-style logic games, with **unlimited generated puzzles**.

## Play locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## How it works

- Each puzzle uses a numeric seed.
- A hidden 6x6 pip layout is generated from the seed.
- Row and column clues show how many pips belong in each line.
- Click cells to cycle between empty, pip, and X.
- Solve as many as you want using **New Puzzle**.
