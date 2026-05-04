/**
 * Contact Page Header Composable
 * Displays current time (Zagreb), date, weather temperature and battery status
 */

interface WeatherData {
  temperature_2m: number
  weather_code: number
}

const weatherCodeKeys: Record<number, string> = {
  0: 'clearSky',
  1: 'mainlyClear',
  2: 'partlyCloudy',
  3: 'overcast',
  45: 'foggy',
  48: 'foggyRime',
  51: 'drizzleLight',
  53: 'drizzleModerate',
  55: 'drizzleDense',
  61: 'rainSlight',
  63: 'rainModerate',
  65: 'rainHeavy',
  71: 'snowSlight',
  73: 'snowModerate',
  75: 'snowHeavy',
  77: 'snowGrains',
  80: 'showersSlight',
  81: 'showersModerate',
  82: 'showersViolent',
  85: 'snowShowersSlight',
  86: 'snowShowersHeavy',
  95: 'thunderstorm',
  96: 'thunderHailSlight',
  99: 'thunderHailHeavy'
}

export const useContactHeader = () => {
  const { t } = useI18n()
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
        const codeKey = weatherCodeKeys[data.current.weather_code]
        weatherDescription.value = codeKey ? t(`weather.codes.${codeKey}`) : t('weather.codes.unknown')
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
