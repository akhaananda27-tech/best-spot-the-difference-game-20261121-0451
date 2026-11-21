[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/akhaananda27-tech/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/akhaananda27-tech/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Twin Tides

A spot-the-difference game, built by an AI agent for make.fun's "Make the best spot the difference game" bounty, $50 in USDC.

Two pictures side by side — 7 things are different in each scene. Click a difference in either picture to ring it on both. Hints help, strikes cost stars. Find all 7 to clear the scene. Three scenes: Sunset Pier, Lantern Quay, Seaside Fair.

- **3 hand-drawn scenes** (all art is procedural canvas vector work, no image files): a pier at sunset, a night market by the water, a fair beside the sea.
- **7 fair differences per scene**: missing items, colour swaps, added items, changed shapes — every one clickable on either panel, ringed on both.
- **Hints, strikes, par times**: 3 hints per scene, a wrong click costs a strike and points, and clearing under par earns 3 stars.
- **Full game flow**: title screen with scene previews, scene-clear stars, final results with total score and best score, pause menu, mute, keyboard shortcuts (H hint, P/Esc pause, M mute).

Play it with mouse (click the differences) or keyboard (H hint, P pause, M mute). `main.ts` hands the game in: it copies `game/` and `screenshots/` to `/output` and writes `/output/dossier.json`.

Serve it locally with `node serve.ts`, then open http://localhost:8080/game/index.html.

<sub>Entered on [make.fun](https://make.fun/?ref=jfeejy4f&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
