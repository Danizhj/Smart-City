import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      title: 'AirCity Dashboard',
      searchPlaceholder: 'Search city...',
      liveAqi: 'Live Air Quality',
      trafficCongestion: 'Traffic Congestion',
      hourlyForecast: '24-Hour Forecast',
      transportSplit: 'Transportation Split',
      neighborhoodRanking: 'Neighborhood Air Quality Ranking',
      weatherForecast: 'Weather & Forecast',
      aiAssistant: 'AI Assistant',
      voiceInput: 'Voice Input',
      stopRecording: 'Stop Recording',
      generating: 'Generating response...',
      listen: 'Listen',
      predictions: 'AI Predictions',
      tomorrow: 'Tomorrow',
      dayAfter: 'Day After',
      environment: 'Environment',
      transportation: 'Transportation',
      airQuality: 'Air Quality',
      medicalAdvice: 'Medical Advice',
      medicalConditions: 'People with these conditions should avoid going outside:',
      parks: 'Largest & Eco-friendly Parks',
      activeAlerts: 'Active Alerts',
      analyzing: 'Analyzing live conditions...',
      loading: 'Loading...',
      fetchingData: 'Fetching data...',
      generatingAi: 'Generating AI forecast...',
      cityNotFound: 'City not found. Please try another name.',
      co2Levels: 'CO2 Levels',
      transitLoad: 'Transit Load',
      peakHours: 'Peak hours',
      openAiChat: 'Open AI Chat',
      chatDescription: 'Chat with our AI assistant to get personalized insights about air quality, traffic, and more.',
      liveEcologyMap: 'Live Ecology Map',
      mapDescription: 'Showing AQI zones & transit hubs',
      medicalConditionsTitle: 'People with these conditions should avoid going outside:',
      sevenDayForecast: '7-Day Forecast',
      districtForecasts: 'District Forecasts:',
      stableConditions: 'Stable conditions expected.',
      slightIncrease: 'Slight increase in pollution.',
      findingParks: 'Finding parks...',
      poweredBy: 'Powered by',
      footer: 'Created by',
      transport: {
        train: 'Train/Metro',
        bus: 'Bus',
        car: 'Car',
        active: 'Active'
      },
      weather: {
        clear: 'Clear sky',
        partlyCloudy: 'Partly cloudy',
        fog: 'Fog',
        rain: 'Rain',
        snow: 'Snow',
        rainShowers: 'Rain showers',
        snowShowers: 'Snow showers',
        thunderstorm: 'Thunderstorm',
        unknown: 'Unknown'
      },
      aqiStatus: {
        good: 'Good',
        moderate: 'Moderate',
        unhealthySensitive: 'Unhealthy for Sensitive Groups',
        unhealthy: 'Unhealthy',
        veryUnhealthy: 'Very Unhealthy',
        hazardous: 'Hazardous'
      },
      trafficStatus: {
        light: 'Light',
        moderate: 'Moderate',
        heavy: 'Heavy',
        congestion: 'congestion'
      },
      alerts: {
        highAqi: 'High AQI in {{city}}',
        highAqiDesc: 'Air quality index reached {{aqi}}. Sensitive groups should reduce outdoor exercise.',
        heavyTraffic: 'Heavy Traffic Detected',
        heavyTrafficDesc: 'Current speeds are {{speed}}km/h ({{congestion}}% congestion). Delays expected.',
        optimal: 'Optimal Conditions',
        optimalDesc: 'Air quality is good and traffic is flowing smoothly in {{city}}.'
      },
      chat: {
        back: 'Back to Dashboard',
        placeholder: 'Ask about air quality or traffic...',
        assistantPrompt: 'You are a helpful AI assistant for the AirCity app. Answer the user\'s question concisely.',
        aiAssistant: 'AirCity AI Assistant',
        emptyState: 'Ask me anything about air quality, traffic, or the environment!',
        thinking: 'Thinking...',
        typeMessage: 'Type your message...',
        listen: 'Listen',
        systemPrompt: 'You are an AI assistant for a service that determines air quality, ecology, traffic jams, and traffic. Answer in the language of the request. Data: Air pollution level: {{aqi}}, City: {{city}}, Air pollution levels by city district: {{districts}}, Traffic jam score now: {{traffic}}, Current weather: {{temp}}°C, Weather for tomorrow, the day after tomorrow and the coming days: {{forecast}}. Answer user questions briefly.'
      }
    }
  },
  ru: {
    translation: {
      title: 'AirCity Дашборд',
      searchPlaceholder: 'Поиск города...',
      liveAqi: 'Качество воздуха',
      trafficCongestion: 'Загруженность дорог',
      hourlyForecast: 'Прогноз на 24 часа',
      transportSplit: 'Разделение транспорта',
      neighborhoodRanking: 'Рейтинг районов по качеству воздуха',
      weatherForecast: 'Погода и прогноз',
      aiAssistant: 'ИИ Помощник',
      voiceInput: 'Голосовой ввод',
      stopRecording: 'Остановить запись',
      generating: 'Генерация ответа...',
      listen: 'Прослушать',
      predictions: 'ИИ Прогнозы',
      tomorrow: 'Завтра',
      dayAfter: 'Послезавтра',
      environment: 'Окружающая среда',
      transportation: 'Транспорт',
      airQuality: 'Качество воздуха',
      medicalAdvice: 'Медицинские советы',
      medicalConditions: 'Людям с этими заболеваниями следует избегать выхода на улицу:',
      parks: 'Крупнейшие и экологичные парки',
      activeAlerts: 'Активные уведомления',
      analyzing: 'Анализ условий...',
      loading: 'Загрузка...',
      fetchingData: 'Получение данных...',
      generatingAi: 'Генерация ИИ прогноза...',
      cityNotFound: 'Город не найден. Попробуйте другое название.',
      co2Levels: 'Уровни CO2',
      transitLoad: 'Нагрузка транзита',
      peakHours: 'Часы пик',
      openAiChat: 'Открыть ИИ Чат',
      chatDescription: 'Общайтесь с нашим ИИ-помощником, чтобы получить персональные данные о качестве воздуха, трафике и многом другом.',
      liveEcologyMap: 'Живая карта экологии',
      mapDescription: 'Показ зон AQI и транспортных узлов',
      medicalConditionsTitle: 'Людям с этими заболеваниями следует избегать выхода на улицу:',
      sevenDayForecast: 'Прогноз на 7 дней',
      districtForecasts: 'Прогноз по районам:',
      stableConditions: 'Ожидаются стабильные условия.',
      slightIncrease: 'Небольшое повышение уровня загрязнения.',
      findingParks: 'Поиск парков...',
      poweredBy: 'Работает на',
      footer: 'Создано',
      transport: {
        train: 'Поезд/Метро',
        bus: 'Автобус',
        car: 'Автомобиль',
        active: 'Активный'
      },
      weather: {
        clear: 'Ясно',
        partlyCloudy: 'Переменная облачность',
        fog: 'Туман',
        rain: 'Дождь',
        snow: 'Снег',
        rainShowers: 'Ливень',
        snowShowers: 'Снегопад',
        thunderstorm: 'Гроза',
        unknown: 'Неизвестно'
      },
      aqiStatus: {
        good: 'Отлично',
        moderate: 'Умеренно',
        unhealthySensitive: 'Вредно для чувствительных групп',
        unhealthy: 'Вредно',
        veryUnhealthy: 'Очень вредно',
        hazardous: 'Опасно'
      },
      trafficStatus: {
        light: 'Легкий',
        moderate: 'Умеренный',
        heavy: 'Тяжелый',
        congestion: 'загруженность'
      },
      alerts: {
        highAqi: 'Высокий AQI в {{city}}',
        highAqiDesc: 'Индекс качества воздуха достиг {{aqi}}. Чувствительным группам следует ограничить физические нагрузки на улице.',
        heavyTraffic: 'Обнаружен плотный трафик',
        heavyTrafficDesc: 'Текущая скорость {{speed}} км/ч ({{congestion}}% загруженность). Ожидаются задержки.',
        optimal: 'Оптимальные условия',
        optimalDesc: 'Качество воздуха хорошее, движение транспорта в {{city}} свободное.'
      },
      chat: {
        back: 'Назад к дашборду',
        placeholder: 'Спросите о качестве воздуха или трафике...',
        assistantPrompt: 'Вы — полезный ИИ-помощник приложения AirCity. Отвечайте на вопросы пользователя кратко.',
        aiAssistant: 'ИИ Помощник AirCity',
        emptyState: 'Спросите меня о чем угодно: о качестве воздуха, пробках или экологии!',
        thinking: 'Думаю...',
        typeMessage: 'Введите сообщение...',
        listen: 'Прослушать',
        systemPrompt: 'Вы — ИИ-помощник сервиса, определяющего качество воздуха, экологию, пробки и трафик. Отвечайте на языке запроса. Данные: Уровень загрязнения воздуха: {{aqi}}, Город: {{city}}, Уровни загрязнения по районам: {{districts}}, Балл пробок сейчас: {{traffic}}, Текущая погода: {{temp}}°C, Прогноз на завтра, послезавтра и ближайшие дни: {{forecast}}. Отвечайте на вопросы пользователя кратко.'
      }
    }
  },
  kk: {
    translation: {
      title: 'AirCity Бақылау тақтасы',
      searchPlaceholder: 'Қаланы іздеу...',
      liveAqi: 'Ауа сапасы',
      trafficCongestion: 'Көлік кептелісі',
      hourlyForecast: '24 сағаттық болжам',
      transportSplit: 'Көлік бөлінісі',
      neighborhoodRanking: 'Ауа сапасы бойынша аудандар рейтингі',
      weatherForecast: 'Ауа райы және болжам',
      aiAssistant: 'ИИ Көмекшісі',
      voiceInput: 'Дауыспен енгізу',
      stopRecording: 'Жазуды тоқтату',
      generating: 'Жауап дайындалуда...',
      listen: 'Тыңдау',
      predictions: 'ИИ Болжамдары',
      tomorrow: 'Ертең',
      dayAfter: 'Бүрсігүні',
      environment: 'Қоршаған орта',
      transportation: 'Көлік',
      airQuality: 'Ауа сапасы',
      medicalAdvice: 'Медициналық кеңестер',
      medicalConditions: 'Мынадай аурулары бар адамдарға далаға шықпау ұсынылады:',
      parks: 'Ең үлкен & экологиялық саябақтар',
      activeAlerts: 'Белсенді ескертулер',
      analyzing: 'Жағдайды талдау...',
      loading: 'Жүктелуде...',
      fetchingData: 'Деректер алынуда...',
      generatingAi: 'ИИ болжамы жасалуда...',
      cityNotFound: 'Қала табылмады. Басқа атауды байқап көріңіз.',
      co2Levels: 'CO2 деңгейі',
      transitLoad: 'Транзит жүктемесі',
      peakHours: 'Қарбалас уақыт',
      openAiChat: 'ИИ чатты ашу',
      chatDescription: 'Ауа сапасы, көлік қозғалысы және т.б. туралы жеке мәліметтер алу үшін біздің ИИ көмекшімізбен сөйлесіңіз.',
      liveEcologyMap: 'Тікелей экология картасы',
      mapDescription: 'AQI аймақтары мен көлік тораптарын көрсету',
      medicalConditionsTitle: 'Мынадай аурулары бар адамдарға далаға шықпау ұсынылады:',
      sevenDayForecast: '7 күндік болжам',
      districtForecasts: 'Аудандар бойынша болжам:',
      stableConditions: 'Тұрақты жағдайлар күтіледі.',
      slightIncrease: 'Ластанудың аздап артуы.',
      findingParks: 'Саябақтарды іздеу...',
      poweredBy: 'Жұмыс істейді',
      footer: 'Жасаған',
      transport: {
        train: 'Пойыз/Метро',
        bus: 'Автобус',
        car: 'Автокөлік',
        active: 'Белсенді'
      },
      weather: {
        clear: 'Ашық',
        partlyCloudy: 'Аздап бұлтты',
        fog: 'Тұман',
        rain: 'Жаңбыр',
        snow: 'Қар',
        rainShowers: 'Нөсер жаңбыр',
        snowShowers: 'Қар жаууы',
        thunderstorm: 'Найзағай',
        unknown: 'Белгісіз'
      },
      aqiStatus: {
        good: 'Жақсы',
        moderate: 'Орташа',
        unhealthySensitive: 'Сезімтал топтар үшін зиянды',
        unhealthy: 'Зиянды',
        veryUnhealthy: 'Өте зиянды',
        hazardous: 'Қауіпті'
      },
      trafficStatus: {
        light: 'Жеңіл',
        moderate: 'Орташа',
        heavy: 'Ауыр',
        congestion: 'кептеліс'
      },
      alerts: {
        highAqi: '{{city}} қаласында жоғары AQI',
        highAqiDesc: 'Ауа сапасының индексі {{aqi}}-ге жетті. Сезімтал топтар даладағы жаттығуларды азайтуы керек.',
        heavyTraffic: 'Ауыр көлік қозғалысы анықталды',
        heavyTrafficDesc: 'Қазіргі жылдамдық {{speed}} км/сағ ({{congestion}}% кептеліс). Кешігулер күтілуде.',
        optimal: 'Оңтайлы жағдайлар',
        optimalDesc: 'Ауа сапасы жақсы және {{city}} қаласында көлік қозғалысы бірқалыпты.'
      },
      chat: {
        back: 'Бақылау тақтасына қайту',
        placeholder: 'Ауа сапасы немесе көлік туралы сұраңыз...',
        assistantPrompt: 'Сіз AirCity қолданбасының пайдалы ИИ көмекшісісіз. Пайдаланушының сұрағына қысқаша жауап беріңіз.',
        aiAssistant: 'AirCity ИИ Көмекшісі',
        emptyState: 'Маған ауа сапасы, кептеліс немесе экология туралы кез келген нәрсені сұраңыз!',
        thinking: 'Ойлануда...',
        typeMessage: 'Хабарлама жазыңыз...',
        listen: 'Тыңдау',
        systemPrompt: 'Сіз ауа сапасын, экологияны, кептелістерді және трафикті анықтайтын қызметтің ИИ көмекшісісіз. Сұраныс тілінде жауап беріңіз. Деректер: Ауаның ластану деңгейі: {{aqi}}, Қала: {{city}}, Аудандар бойынша ластану деңгейлері: {{districts}}, Қазіргі кептеліс балы: {{traffic}}, Қазіргі ауа райы: {{temp}}°C, Ертеңгі, бүрсігүнгі және алдағы күндерге арналған ауа райы болжамы: {{forecast}}. Пайдаланушы сұрақтарына қысқаша жауап беріңіз.'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
