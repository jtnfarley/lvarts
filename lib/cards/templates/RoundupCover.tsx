import type { RoundupKind } from '../roundupWindow';
import { theme } from '../theme';

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

// Only daily covers carry an accent: a weekday stamp.
function WeekdayStamp({ dateLabel }: Pick<RoundupCoverProps, 'dateLabel'>) {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: 190,
				height: 190,
				borderRadius: 95,
				border: `8px solid ${colors.paper}`,
				fontFamily: fonts.display,
				fontWeight: 600,
				fontSize: 72,
				color: colors.paper,
				transform: 'rotate(-10deg)',
			}}
		>
			{dateLabel.split(' ')[0]}
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
				<img src={logoUrl} width={Math.round(260 * theme.coverLogoAspect)} height={260} alt="" />
				{kind === 'daily' && <WeekdayStamp dateLabel={dateLabel} />}
			</div>
			<div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
				<div style={{ display: 'flex', fontFamily: fonts.cover, fontSize: 127, lineHeight: 1.05, color: colors.paper }}>
					{headline}
				</div>
				<div style={{ display: 'flex', fontFamily: fonts.body, fontSize: 58, fontWeight: 700, color: colors.ink, marginTop: 36 }}>
					{dateLabel}
				</div>
			</div>
			<div style={{ display: 'flex', flexDirection: 'column', padding: '30px 36px', backgroundColor: colors.paper, borderRadius: 20 }}>
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
