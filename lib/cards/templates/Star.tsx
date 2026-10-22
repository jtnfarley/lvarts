type StarProps = { size: number; color: string; opacity?: number; style?: Record<string, string | number> };

// Drawn as SVG because the card fonts have no star glyph.
export function Star({ size, color, opacity = 1, style }: StarProps) {
	return (
		<svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity, ...style }}>
			<polygon
				points="50,4 62,37 96,37 68,58 79,92 50,71 21,92 32,58 4,37 38,37"
				fill={color}
			/>
		</svg>
	);
}
