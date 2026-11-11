export const theme = {
	width: 1080,
	height: 1350,
	margin: 64,
	colors: {
		orange: '#FF7F25',
		paper: '#FFFFFF',
		orangeText: '#D95A00',
		ink: '#2B2118',
		star: '#FFE11A',
	},
	fonts: {
		display: 'Gilroy',
		cover: 'Chelsea Market',
		body: 'Courier Prime',
	},
	// Width over height of public/brand/logo.png.
	logoAspect: 435 / 192,
	// Width over height of the full-silhouette logo used on roundup covers.
	coverLogoAspect: 423 / 296,
	siteName: 'lvartandmusic.com',
	jpegQuality: 90,
	maxRoundupEvents: 9,
} as const;
