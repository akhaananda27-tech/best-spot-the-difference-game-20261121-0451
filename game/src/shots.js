// The screenshot scenes behind ?shot=start|play|play2|end. Each one sets the world to
// a real state a player could reach — title, mid-scene with some differences found
// and several still unfound, a later scene further along, and the results screen —
// so every frame is what the game really looks like at that moment.
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_RESULTS, startRun, clickAt } from './world.js';
import { SCENE_DIFFS } from './scenes.js';

function findDiffs(w, sceneIndex, count) {
  // Play a scene forward by clicking its first `count` differences, in order.
  w.sceneIndex = sceneIndex;
  w.found = new Set();
  w.strikes = 0;
  w.hintsLeft = 3;
  w.time = 0;
  w.screen = SCREEN_PLAY;
  const diffs = SCENE_DIFFS[sceneIndex];
  for (let i = 0; i < count && i < diffs.length; i += 1) {
    clickAt(w, diffs[i].x, diffs[i].y);
  }
}

/**
 * Set `world` to the named scene and return the screen to draw. Unknown names are start.
 * - start: title screen, fresh world.
 * - play: scene 1 (Sunset Pier) with 3 of 7 found, 4 still to find, timer at 0:47.
 * - play2: scene 2 (Lantern Quay) with 5 of 7 found, 2 still to find, timer at 1:12.
 * - end: results screen after all three scenes, 8 of 9 stars.
 */
export function stageShot(name, world) {
  if (name === 'play') {
    startRun(world);
    findDiffs(world, 0, 3);
    world.time = 47;
    world.score = 300;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'play2') {
    startRun(world);
    world.stars = [3, 0, 0];
    world.score = 640;
    world.totalTime = 82;
    world.sceneIndex = 1;
    findDiffs(world, 1, 5);
    world.time = 72;
    world.score = 640 + 500;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'end') {
    startRun(world);
    world.stars = [3, 3, 2];
    world.score = 2480;
    world.totalTime = 274;
    world.best = 2480;
    world.sceneIndex = 2;
    world.screen = SCREEN_RESULTS;
    return { screen: SCREEN_RESULTS };
  }
  world.screen = SCREEN_TITLE;
  return { screen: SCREEN_TITLE };
}
