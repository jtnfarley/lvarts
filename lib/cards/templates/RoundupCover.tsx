import type { RoundupKind } from '../roundupWindow';
import { theme } from '../theme';
import { Star } from './Star';

const { colors, fonts, margin } = theme;

export type RoundupCoverProps = {
	kind: RoundupKind;
	headline: string;
	dateLabel: string;
	shownCount: number;
	moreCount: number;
	logoUrl: string;
};

const countLine = (count: number): string =>
	`${count} ${count === 1 ? 'show or opening' : 'shows and openings'}`;

// Daily covers carry a weekday stamp; weekend and custom covers get a star cluster instead.
function Accent({ kind, dateLabel }: Pick<RoundupCoverProps, 'kind' | 'dateLabel'>) {
	if (kind === 'daily') {
		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					width: 190,
					height: 190,
					borderRadius: 95,
					border: `8px solid ${colors.cream}`,
					fontFamily: fonts.display,
					fontSize: 72,
					color: colors.cream,
					transform: 'rotate(-10deg)',
				}}
			>
				{dateLabel.split(' ')[0]}
			</div>
		);
	}
	return (
		<div style={{ display: 'flex', alignItems: 'flex-end' }}>
			<Star size={90} color={colors.star} />
			<Star size={150} color={colors.star} style={{ marginLeft: -10, marginBottom: 20 }} />
			<Star size={70} color={colors.star} style={{ marginLeft: -10 }} />
		</div>
	);
}

export function RoundupCover({ kind, headline, dateLabel, shownCount, moreCount, logoUrl }: RoundupCoverProps) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				width: theme.width,
				height: theme.height,
				padding: margin,
				backgroundColor: colors.orange,
			}}
		>
			<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={logoUrl} width={Math.round(200 * theme.logoAspect)} height={200} alt="" />
				<Accent kind={kind} dateLabel={dateLabel} />
			</div>
			<div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
				<div style={{ display: 'flex', fontFamily: fonts.display, fontSize: 118, lineHeight: 1.05, color: colors.cream }}>
					{headline}
				</div>
				<div style={{ display: 'flex', fontFamily: fonts.body, fontSize: 58, fontWeight: 700, color: colors.ink, marginTop: 36 }}>
					{dateLabel}
				</div>
			</div>
			<div style={{ display: 'flex', flexDirection: 'column', padding: '30px 36px', backgroundColor: colors.cream }}>
				<div style={{ display: 'flex', fontFamily: fonts.body, fontSize: 36, fontWeight: 700, color: colors.ink }}>
					{`${countLine(shownCount)} · swipe >`}
				</div>
				{moreCount > 0 && (
					<div style={{ display: 'flex', fontFamily: fonts.body, fontSize: 30, color: colors.ink, marginTop: 10 }}>
						{`+ ${moreCount} more at ${theme.siteName}`}
					</div>
				)}
			</div>
		</div>
	);
}
