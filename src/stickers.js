import {
  faBolt,
  faBug,
  faCamera,
  faCat,
  faCheck,
  faCircle,
  faCloud,
  faCloudSun,
  faCrown,
  faCrow,
  faDiamond,
  faDog,
  faExclamation,
  faFaceGrinBeam,
  faFaceGrinStars,
  faFaceGrinTongueWink,
  faFaceKissWinkHeart,
  faFaceLaughBeam,
  faFaceMeh,
  faFaceSmile,
  faFaceSurprise,
  faFire,
  faFish,
  faFrog,
  faGamepad,
  faGem,
  faGhost,
  faHeadphones,
  faHeart,
  faHexagon,
  faHippo,
  faInfinity,
  faLeaf,
  faMoon,
  faMusic,
  faPaw,
  faPeace,
  faPlay,
  faQuestion,
  faRainbow,
  faRocket,
  faSeedling,
  faSnowflake,
  faSquare,
  faStar,
  faSun,
  faWandMagicSparkles,
  faYinYang,
} from "@fortawesome/free-solid-svg-icons";

// Font Awesome Free icons are used under CC BY 4.0:
// https://fontawesome.com/license/free

const groups = {
  "Basic shapes": [
    ["circle", "Circle", faCircle],
    ["square", "Square", faSquare],
    ["diamond", "Diamond", faDiamond],
    ["play", "Play triangle", faPlay],
    ["heart", "Heart", faHeart],
    ["star", "Star", faStar],
    ["hexagon", "Hexagon", faHexagon],
    ["cloud", "Cloud", faCloud],
  ],
  Symbols: [
    ["bolt", "Lightning bolt", faBolt],
    ["peace", "Peace sign", faPeace],
    ["yin-yang", "Yin yang", faYinYang],
    ["music", "Music note", faMusic],
    ["infinity", "Infinity", faInfinity],
    ["check", "Check mark", faCheck],
    ["question", "Question mark", faQuestion],
    ["exclamation", "Exclamation mark", faExclamation],
  ],
  Emojis: [
    ["smile", "Smiling face", faFaceSmile],
    ["laugh", "Laughing face", faFaceLaughBeam],
    ["star-eyes", "Star eyes", faFaceGrinStars],
    ["kiss", "Kiss face", faFaceKissWinkHeart],
    ["surprise", "Surprised face", faFaceSurprise],
    ["grin", "Grinning face", faFaceGrinBeam],
    ["meh", "Meh face", faFaceMeh],
    ["silly", "Silly face", faFaceGrinTongueWink],
  ],
  Nature: [
    ["sun", "Sun", faSun],
    ["moon", "Moon", faMoon],
    ["cloud-sun", "Sun behind cloud", faCloudSun],
    ["snowflake", "Snowflake", faSnowflake],
    ["fire", "Fire", faFire],
    ["leaf", "Leaf", faLeaf],
    ["seedling", "Seedling", faSeedling],
    ["rainbow", "Rainbow", faRainbow],
  ],
  Animals: [
    ["paw", "Paw print", faPaw],
    ["cat", "Cat", faCat],
    ["dog", "Dog", faDog],
    ["frog", "Frog", faFrog],
    ["fish", "Fish", faFish],
    ["bug", "Bug", faBug],
    ["crow", "Bird", faCrow],
    ["hippo", "Hippo", faHippo],
  ],
  "Fun stuff": [
    ["rocket", "Rocket", faRocket],
    ["ghost", "Ghost", faGhost],
    ["crown", "Crown", faCrown],
    ["gem", "Gem", faGem],
    ["magic", "Magic wand", faWandMagicSparkles],
    ["gamepad", "Game controller", faGamepad],
    ["headphones", "Headphones", faHeadphones],
    ["camera", "Camera", faCamera],
  ],
};

export const STICKER_CATEGORIES = Object.fromEntries(
  Object.entries(groups).map(([category, stickers]) => [
    category,
    stickers.map(([key]) => key),
  ]),
);

export const STICKER_DETAILS = Object.fromEntries(
  Object.entries(groups).flatMap(([category, stickers]) =>
    stickers.map(([key, name, icon]) => [
      key,
      {
        category,
        name,
        width: icon.icon[0],
        height: icon.icon[1],
        path: icon.icon[4],
      },
    ]),
  ),
);

export const STICKERS = Object.keys(STICKER_DETAILS);
export const STICKER_NAMES = Object.fromEntries(
  Object.entries(STICKER_DETAILS).map(([key, sticker]) => [key, sticker.name]),
);

export function stickerSvg(key) {
  const sticker = STICKER_DETAILS[key];
  if (!sticker) return "";
  return `<svg viewBox="0 0 ${sticker.width} ${sticker.height}" aria-hidden="true" focusable="false"><path d="${sticker.path}"></path></svg>`;
}
