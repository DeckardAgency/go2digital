/**
 * Contact Page Header Composable
 * Displays current time (Zagreb), date, weather temperature and battery status
 */

interface WeatherData {
  temperature_2m: number
  weather_code: number
}

const weatherCodes: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Foggy with rime',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
}

export const useContactHeader = () => {
  const time = ref('')
  const date = ref('')
  const temperature = ref('--°')
  const weatherDescription = ref('')
  const batteryPercentage = ref(100)

  let timeInterval: ReturnType<typeof setInterval> | null = null
  let weatherInterval: ReturnType<typeof setInterval> | null = null

  const timezone = 'Europe/Zagreb'
  const batteryStartTime = 9  // 9 AM
  const batteryEndTime = 17   // 5 PM

  const formatTime = (d: Date): string => {
    return new Intl.DateTimeFormat('hr-HR', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(d)
  }

  const formatDate = (d: Date): string => {
    return new Intl.DateTimeFormat('hr-HR', {
      timeZone: timezone,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d)
  }

  const calculateBatteryPercentage = (d: Date): number => {
    const hours = d.getHours()
    const minutes = d.getMinutes()
    const currentTimeInMinutes = hours * 60 + minutes

    const startTimeInMinutes = batteryStartTime * 60
    const endTimeInMinutes = batteryEndTime * 60

    if (currentTimeInMinutes < startTimeInMinutes) return 100
    if (currentTimeInMinutes >= endTimeInMinutes) return 0

    const totalMinutes = endTimeInMinutes - startTimeInMinutes
    const elapsedMinutes = currentTimeInMinutes - startTimeInMinutes
    return Math.round(100 - ((elapsedMinutes / totalMinutes) * 100))
  }

  const updateTime = () => {
    const now = new Date()
    time.value = formatTime(now)
    date.value = formatDate(now)
    batteryPercentage.value = calculateBatteryPercentage(now)
  }

  const fetchWeather = async () => {
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?' +
        'latitude=45.815&longitude=15.982&' +
        'current=temperature_2m,weather_code&' +
        'temperature_unit=celsius&' +
        'timezone=Europe/Zagreb'
      )

      if (!response.ok) throw new Error('Weather API error')

      const data = await response.json()

      if (data.current && typeof data.current.temperature_2m === 'number') {
        temperature.value = `${Math.round(data.current.temperature_2m)}°`
        weatherDescription.value = weatherCodes[data.current.weather_code] || 'Unknown'
      }
    } catch (error) {
      console.warn('Failed to fetch weather:', error)
    }
  }

  const init = () => {
    updateTime()
    fetchWeather()

    timeInterval = setInterval(updateTime, 1000)
    weatherInterval = setInterval(fetchWeather, 300000) // 5 minutes
  }

  const destroy = () => {
    if (timeInterval) {
      clearInterval(timeInterval)
      timeInterval = null
    }
    if (weatherInterval) {
      clearInterval(weatherInterval)
      weatherInterval = null
    }
  }

  return {
    time,
    date,
    temperature,
    weatherDescription,
    batteryPercentage,
    init,
    destroy
  }
}
