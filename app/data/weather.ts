export interface CurrentWeather {
	temperatureF: number
	weatherCode: number
	isDay: boolean
}

// Bethlehem, PA
const LATITUDE = 40.6259
const LONGITUDE = -75.3705

export async function getCurrentWeather(): Promise<CurrentWeather | null> {
	try {
		const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weather_code,is_day&temperature_unit=fahrenheit&timezone=America%2FNew_York`
		const res = await fetch(url, { next: { revalidate: 1800 } })

		if (!res.ok) return null

		const data = await res.json()
		const current = data?.current

		if (!current || typeof current.temperature_2m !== 'number') return null

		return {
			temperatureF: Math.round(current.temperature_2m),
			weatherCode: current.weather_code,
			isDay: current.is_day === 1,
		}
	} catch {
		return null
	}
}
