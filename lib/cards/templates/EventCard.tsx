import type { CardEvent } from '../getCardEvent';
import { IMAGE_PANEL_HEIGHT, type PreparedImage } from '../prepareImage';
import { formatDateLine, titleStyle } from '../text';
import { theme } from '../theme';
import { Star } from './Star';

const { colors, fonts, margin } = theme;
const FOOTER_HEIGHT = 160;

type EventCardProps = {
	event: CardEvent;
	image: PreparedImage | null;
	logoUrl: string;
};

function Footer({ event, logoUrl }: { event: CardEvent; logoUrl: string }) {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'flex-start',
				justifyContent: 'space-between',
				height: FOOTER_HEIGHT,
				padding: `24px ${margin}px 0`,
				backgroundColor: colors.orange,
			}}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={logoUrl} width={Math.round(72 * theme.logoAspect)} height={72} alt="" />
			<div style={{ display: 'flex', fontFamily: fonts.body, fontSize: 28, fontWeight: 700, color: colors.cream, marginTop: 20 }}>
				{event.url}
			</div>
		</div>
	);
}

function VenueLine({ event, size }: { event: CardEvent; size: number }) {
	if (!event.venueName) return null;
	const text = event.town ? `${event.venueName} · ${event.town}` : event.venueName;
	return (
		<div style={{ display: 'flex', fontFamily: fonts.body, fontSize: size, color: colors.ink, marginTop: 14 }}>
			{text}
		</div>
	);
}

function WithImage({ event, image, logoUrl }: EventCardProps & { image: PreparedImage }) {
	const title = titleStyle(event.title, true);
	return (
		<div style={{ display: 'flex', flexDirection: 'column', width: theme.width, height: theme.height }}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					position: 'relative',
					width: theme.width,
					height: IMAGE_PANEL_HEIGHT,
					backgroundColor: colors.ink,
				}}
			>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img
					src={image.backdropUrl}
					width={theme.width}
					height={IMAGE_PANEL_HEIGHT}
					alt=""
					style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
				/>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={image.fittedUrl} width={image.fittedWidth} height={image.fittedHeight} alt="" />
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					flex: 1,
					padding: `34px ${margin}px 0`,
					backgroundColor: colors.cream,
				}}
			>
				<div style={{ display: 'flex', fontFamily: fonts.body, fontSize: 34, fontWeight: 700, color: colors.orange }}>
					{formatDateLine(event.date)}
				</div>
				<div
					style={{
						display: 'flex',
						fontFamily: fonts.display,
						fontSize: title.fontSize,
						lineHeight: 1.1,
						color: colors.ink,
						marginTop: 12,
						lineClamp: 3,
					}}
				>
					{title.text}
				</div>
				<VenueLine event={event} size={32} />
			</div>
			<Footer event={event} logoUrl={logoUrl} />
		</div>
	);
}

function WithoutImage({ event, logoUrl }: Omit<EventCardProps, 'image'>) {
	const title = titleStyle(event.title, false);
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: theme.width,
				height: theme.height,
				backgroundColor: colors.orange,
			}}
		>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					position: 'relative',
					flex: 1,
					margin: `${margin}px ${margin}px 0`,
					padding: 56,
					backgroundColor: colors.cream,
					overflow: 'hidden',
				}}
			>
				<Star size={520} color={colors.star} opacity={0.22} style={{ position: 'absolute', right: -110, bottom: -110 }} />
				<div style={{ display: 'flex', fontFamily: fonts.body, fontSize: 38, fontWeight: 700, color: colors.orange }}>
					{formatDateLine(event.date)}
				</div>
				<div
					style={{
						display: 'flex',
						fontFamily: fonts.display,
						fontSize: title.fontSize,
						lineHeight: 1.08,
						color: colors.ink,
						marginTop: 20,
						lineClamp: 6,
					}}
				>
					{title.text}
				</div>
				<VenueLine event={event} size={36} />
				{event.snippet && (
					<div style={{ display: 'flex', fontFamily: fonts.body, fontSize: 30, lineHeight: 1.35, color: colors.ink, marginTop: 28 }}>
						{event.snippet}
					</div>
				)}
			</div>
			<Footer event={event} logoUrl={logoUrl} />
		</div>
	);
}

export function EventCard({ event, image, logoUrl }: EventCardProps) {
	return image ? (
		<WithImage event={event} image={image} logoUrl={logoUrl} />
	) : (
		<WithoutImage event={event} logoUrl={logoUrl} />
	);
}
