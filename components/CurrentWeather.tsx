import { CloudFog, CloudLightning, CloudRain, CloudSnow, Cloudy, Moon, Sun } from "lucide-react";
import { getCurrentWeather } from "@/app/data/weather";

function describeWeather(code: number): string {
	if (code === 0) return "Clear sky";
	if (code === 1) return "Mostly clear";
	if (code === 2) return "Partly cloudy";
	if (code === 3) return "Overcast";
	if (code === 45 || code === 48) return "Foggy";
	if (code >= 51 && code <= 57) return "Drizzle";
	if (code >= 61 && code <= 67) return "Rain";
	if (code >= 71 && code <= 77) return "Snow";
	if (code >= 80 && code <= 82) return "Rain showers";
	if (code >= 85 && code <= 86) return "Snow showers";
	if (code >= 95) return "Thunderstorms";
	return "Weather unavailable";
}

function WeatherIcon({ code, isDay }: { code: number; isDay: boolean }) {
	const className = "size-10 text-lvartsmusic-foreground";

	if (code === 0 || code === 1) return isDay ? <Sun className={className} /> : <Moon className={className} />;
	if (code === 2 || code === 3) return <Cloudy className={className} />;
	if (code === 45 || code === 48) return <CloudFog className={className} />;
	if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain className={className} />;
	if (code >= 71 && code <= 86) return <CloudSnow className={className} />;
	if (code >= 95) return <CloudLightning className={className} />;
	return <Cloudy className={className} />;
}

export default async function CurrentWeather() {
	const weather = await getCurrentWeather();

	if (!weather) {
		return (
			<div className="px-4 py-3 text-sm text-lvartsmusic-muted">
				Weather unavailable right now.
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3 px-4 py-3">
			<WeatherIcon code={weather.weatherCode} isDay={weather.isDay} />
			<div>
				<div className="text-2xl font-extrabold text-lvartsmusic-foreground">{weather.temperatureF}°F</div>
				<div className="text-xs text-lvartsmusic-muted">{describeWeather(weather.weatherCode)}</div>
			</div>
		</div>
	);
}
