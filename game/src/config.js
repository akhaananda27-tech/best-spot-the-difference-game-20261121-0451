// Every tuning number and colour in one place. The playfield is a fixed 1280x720 logical
// area; the renderer scales it to the window, so no rule below depends on screen size.
export const FIELD = { width: 1280, height: 720 };

// One scene panel is 600x460 in logical units; the two panels sit side by side.
export const PANEL = { w: 600, h: 460, leftX: 24, rightX: 656, y: 118 };

export const STEP = 1 / 60;

export const SCENES = [
  { name: 'Sunset Pier', par: 90, blurb: 'Dusk on the old pier' },
  { name: 'Lantern Quay', par: 100, blurb: 'Night market by the water' },
  { name: 'Seaside Fair', par: 110, blurb: 'A fair beside the sea' },
];

export const DIFFS_PER_SCENE = 7;
export const HINTS_PER_SCENE = 3;
export const HINT_FLASH_SECONDS = 2;
export const WRONG_FLASH_SECONDS = 0.9;
export const FOUND_FLASH_SECONDS = 1.2;
export const POINTS_PER_FIND = 100;
export const STRIKE_PENALTY = 50;

export const PALETTE = {
  backdrop: '#0e1424',
  hud: '#131a2e',
  panel: '#1a2238',
  text: '#f2f4f8',
  muted: '#93a0b8',
  gold: '#f5b81e',
  amber: '#f6a609',
  amberDark: '#d18a05',
  green: '#3fce7c',
  red: '#e5534b',
  ring: '#ffd94d',
  ringNew: '#3fce7c',
  vs: '#f5b81e',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best result is kept between visits (this browser only). */
export const BEST_KEY = 'twin-tides.best';
