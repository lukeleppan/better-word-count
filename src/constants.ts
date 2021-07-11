export const VIEW_TYPE_STATS = "vault-stats";
export const STATS_FILE = ".vault-stats";
export const STATS_ICON = `<g transform="matrix(0.95,0,0,0.95,2.5,2.5)"><path fill="currentColor" stroke="currentColor" d="M3.77,100L22.421,100C24.503,100 26.19,98.013 26.19,95.561L26.19,34.813C26.19,32.361 24.503,30.374 22.421,30.374L3.77,30.374C1.688,30.374 -0,32.361 -0,34.813L-0,95.561C-0,98.013 1.688,100 3.77,100ZM40.675,100L59.325,100C61.408,100 63.095,98.013 63.095,95.561L63.095,4.439C63.095,1.987 61.408,-0 59.325,-0L40.675,-0C38.592,-0 36.905,1.987 36.905,4.439L36.905,95.561C36.905,98.013 38.592,100 40.675,100ZM77.579,100L96.23,100C98.312,100 100,98.013 100,95.561L100,46.495C100,44.043 98.312,42.056 96.23,42.056L77.579,42.056C75.497,42.056 73.81,44.043 73.81,46.495L73.81,95.561C73.81,98.013 75.497,100 77.579,100Z" style="fill:none;fill-rule:nonzero;stroke-width:8px;"/></g>`;
export const STATS_ICON_NAME = "stats-graph";
export const MATCH_HTML_COMMENT = new RegExp(
  "<!--[\\s\\S]*?(?:-->)?" +
    "<!---+>?" +
    "|<!(?![dD][oO][cC][tT][yY][pP][eE]|\\[CDATA\\[)[^>]*>?" +
    "|<[?][^>]*>?",
  "g"
);
export const MATCH_COMMENT = new RegExp("%%[^%%]+%%", "g");
export const MATCH_PARAGRAPH = new RegExp("\n([^\n]+)\n", "g");
