export default function TrendingPlaceholder() {
	return (
		<div className="mt-1">
			{[1, 2, 3].map((i) => (
				<div key={i} className="block w-full px-4 py-2.5 opacity-50">
					<p className="text-xs text-lvartsmusic-muted">Trending</p>
					<p className="font-bold text-lvartsmusic-muted">Coming soon</p>
				</div>
			))}
		</div>
	)
}
