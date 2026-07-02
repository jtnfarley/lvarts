export default function CommunityPlaceholder() {
	return (
		<div className="mt-1 divide-y divide-lvartsmusic-border">
			{[1, 2, 3].map((i) => (
				<div key={i} className="flex items-center gap-3 px-1 py-2.5 opacity-50">
					<div className="h-9 w-9 shrink-0 rounded-full border border-dashed border-lvartsmusic-muted" />
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-semibold text-lvartsmusic-muted">Communities</p>
						<p className="truncate text-xs text-lvartsmusic-muted">Coming soon</p>
					</div>
				</div>
			))}
		</div>
	)
}
