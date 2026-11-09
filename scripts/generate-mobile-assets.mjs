// Generates the mobile app icons, splash image and Play Store graphics from the site's
// vector logos. Run from the repo root: node scripts/generate-mobile-assets.mjs
import { mkdir, readFile } from 'node:fs/promises';
import sharp from 'sharp';

const ORANGE = '#ff7f25';
const ABBR_SVG = 'public/logos/art-abbr-paths.svg'; // orange circle with white "LV A&M"
const WIDE_SVG = 'public/logos/lvarts-artsy-paths.svg'; // wide "Lehigh Valley Art & Music"
const ASSETS = 'mobile/assets';
const STORE = 'mobile/store-assets';

const abbrSvg = await readFile(ABBR_SVG, 'utf8');
const circle = /<circle class="st1"[^>]*\/>/;
if (!circle.test(abbrSvg)) throw new Error(`Could not find the orange circle in ${ABBR_SVG}`);

// The letters alone: white on transparent. The monochrome version swaps the thin orange
// outlines for white so the letters read as one solid silhouette.
const lettersSvg = abbrSvg.replace(circle, '');
const silhouetteSvg = lettersSvg.replaceAll(ORANGE, '#fff');

// SVGs here have no fixed size, so density decides how large they rasterize (72 dpi = 1px per unit).
const SVG_UNITS = 304.88;
const render = (svg, width) =>
	sharp(Buffer.from(svg), { density: (72 * width) / SVG_UNITS }).png().toBuffer();

// Rasterize large, then trim the transparent margin so sizing is relative to the letters.
const trimmedLetters = async (svg) => {
	const { data, info } = await sharp(await render(svg, 2400)).trim().toBuffer({ resolveWithObject: true });
	return { data, width: info.width, height: info.height };
};

// Places the letters, centered, on a square canvas. `diagonal` keeps them inside a circle of
// that diameter (for the adaptive-icon safe zone); `widthFraction` sizes by width instead.
const compose = async (letters, { size, background, diagonal, widthFraction }) => {
	const scale = diagonal ? diagonal / Math.hypot(letters.width, letters.height) : (widthFraction * size) / letters.width;
	const width = Math.round(letters.width * scale);
	const height = Math.round(letters.height * scale);
	const resized = await sharp(letters.data).resize(width, height).toBuffer();
	return sharp({ create: { width: size, height: size, channels: 4, background } })
		.composite([{ input: resized, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
		.png()
		.toBuffer();
};

await mkdir(ASSETS, { recursive: true });
await mkdir(STORE, { recursive: true });

const SIZE = 1024;
// Android only guarantees the central 66dp of the 108dp adaptive icon is never masked away.
const SAFE_ZONE_DIAMETER = (66 / 108) * SIZE;
const adaptiveDiagonal = SAFE_ZONE_DIAMETER * 0.97;

const letters = await trimmedLetters(lettersSvg);
const silhouette = await trimmedLetters(silhouetteSvg);
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

// Adaptive icon layers: the launcher draws the orange background under the foreground.
const foreground = await compose(letters, { size: SIZE, background: transparent, diagonal: adaptiveDiagonal });
const monochrome = await compose(silhouette, { size: SIZE, background: transparent, diagonal: adaptiveDiagonal });

// Legacy / store icon: a full-bleed opaque square (the OS applies its own corner mask).
// The letters take 81% of the width, leaving roughly half the orange margin of the first version.
const icon = await compose(letters, { size: SIZE, background: ORANGE, widthFraction: 0.81 });

// Notification small icon: Android draws it as a single-color silhouette at about 24dp, where
// thin lettering is illegible. A solid disc with the letters knocked out stays readable.
const NOTIFICATION_SIZE = 96;
const disc = Buffer.from(
	`<svg xmlns="http://www.w3.org/2000/svg" width="${NOTIFICATION_SIZE}" height="${NOTIFICATION_SIZE}"><circle cx="${NOTIFICATION_SIZE / 2}" cy="${NOTIFICATION_SIZE / 2}" r="${NOTIFICATION_SIZE / 2 - 1}" fill="#fff"/></svg>`
);
const notificationScale = (NOTIFICATION_SIZE * 0.82) / Math.hypot(silhouette.width, silhouette.height);
const notificationWidth = Math.round(silhouette.width * notificationScale);
const notificationHeight = Math.round(silhouette.height * notificationScale);
const notificationIcon = await sharp(disc)
	.composite([
		{
			input: await sharp(silhouette.data).resize(notificationWidth, notificationHeight).toBuffer(),
			left: Math.round((NOTIFICATION_SIZE - notificationWidth) / 2),
			top: Math.round((NOTIFICATION_SIZE - notificationHeight) / 2),
			blend: 'dest-out',
		},
	])
	.png()
	.toBuffer();

// Splash: the whole circular mark, shown on the black splash background.
const splash = await render(abbrSvg, SIZE);

// Play feature graphic: the wide logo fitted by width, with its own orange border extended.
const FEATURE = { width: 1024, height: 500 };
const wideLogo = await sharp(Buffer.from(await readFile(WIDE_SVG)), { density: (72 * FEATURE.width) / 434 })
	.resize(FEATURE.width)
	.png()
	.toBuffer({ resolveWithObject: true });
const featureGraphic = await sharp({ create: { ...FEATURE, channels: 4, background: ORANGE } })
	.composite([{ input: wideLogo.data, left: 0, top: Math.round((FEATURE.height - wideLogo.info.height) / 2) }])
	.png()
	.toBuffer();

const write = (buffer, path) => sharp(buffer).toFile(path);
await Promise.all([
	sharp(icon).flatten({ background: ORANGE }).removeAlpha().toFile(`${ASSETS}/icon.png`),
	write(foreground, `${ASSETS}/android-icon-foreground.png`),
	write(monochrome, `${ASSETS}/android-icon-monochrome.png`),
	write(splash, `${ASSETS}/splash-icon.png`),
	write(notificationIcon, `${ASSETS}/notification-icon.png`),
	sharp(icon).resize(48, 48).toFile(`${ASSETS}/favicon.png`),
	sharp(icon).resize(512, 512).ensureAlpha().png().toFile(`${STORE}/play-store-icon-512.png`),
	write(featureGraphic, `${STORE}/feature-graphic-1024x500.png`),
]);

console.log('Wrote mobile/assets/* and mobile/store-assets/*');
