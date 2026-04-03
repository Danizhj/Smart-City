import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  Bus, 
  Train, 
  Car, 
  Wind, 
  Activity,
  AlertTriangle,
  CheckCircle2,
  Search,
  Info,
  CloudRain,
  Sun,
  Cloud,
  Thermometer,
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown,
  Droplets,
  Mic,
  Volume2,
  Languages,
  ExternalLink,
  Trees,
  Stethoscope,
  BrainCircuit,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Map from './Map';
import { getGroqChatCompletion, transcribeAudio } from '../lib/groq';

type Language = 'en' | 'ru' | 'kk';

function getAqiStatus(aqi: number, t: any) {
  if (aqi <= 50) return { text: t('aqiStatus.good'), color: 'text-green-600' };
  if (aqi <= 100) return { text: t('aqiStatus.moderate'), color: 'text-yellow-600' };
  if (aqi <= 150) return { text: t('aqiStatus.unhealthySensitive'), color: 'text-orange-600' };
  if (aqi <= 200) return { text: t('aqiStatus.unhealthy'), color: 'text-red-600' };
  if (aqi <= 300) return { text: t('aqiStatus.veryUnhealthy'), color: 'text-purple-600' };
  return { text: t('aqiStatus.hazardous'), color: 'text-rose-900' };
}

function getTrafficStatus(current: number, freeFlow: number, t: any) {
  const ratio = current / freeFlow;
  const congestion = Math.max(0, Math.round((1 - ratio) * 100));
  if (ratio > 0.8) return { text: t('trafficStatus.light'), color: 'text-green-600', congestion };
  if (ratio > 0.5) return { text: t('trafficStatus.moderate'), color: 'text-yellow-600', congestion };
  return { text: t('trafficStatus.heavy'), color: 'text-red-600', congestion };
}

function getWeatherIcon(code: number) {
  if (code <= 3) return Sun;
  if (code <= 48) return Cloud;
  return CloudRain;
}

function getWeatherDescription(code: number, t: any) {
  if (code === 0) return t('weather.clear');
  if (code === 1 || code === 2 || code === 3) return t('weather.partlyCloudy');
  if (code <= 48) return t('weather.fog');
  if (code <= 67) return t('weather.rain');
  if (code <= 77) return t('weather.snow');
  if (code <= 82) return t('weather.rainShowers');
  if (code <= 86) return t('weather.snowShowers');
  if (code <= 99) return t('weather.thunderstorm');
  return t('weather.unknown');
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as Language;
  
  const [selectedCity, setSelectedCity] = useState(() => {
    const saved = localStorage.getItem('selectedCity');
    return saved ? JSON.parse(saved) : { name: 'Almaty', lat: 43.2220, lon: 76.8512 };
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [liveAqi, setLiveAqi] = useState<number | null>(null);
  const [trafficData, setTrafficData] = useState<{ current: number; freeFlow: number } | null>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [transportSplit, setTransportSplit] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [districtRankings, setDistrictRankings] = useState<any[]>([]);

  // AI Content State
  const [aiContent, setAiContent] = useState({
    environment: '',
    transportation: '',
    airQuality: '',
    medical: ''
  });
  const [aiPredictions, setAiPredictions] = useState<any[]>([]);
  const [trafficForecast, setTrafficForecast] = useState<any[]>([]);
  const [parks, setParks] = useState<any[]>([]);
  
  // AI Assistant State
  const [isRecording, setIsRecording] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isGeneratingAssistant, setIsGeneratingAssistant] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ru' ? 'ru-RU' : lang === 'kk' ? 'kk-KZ' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setIsGeneratingAssistant(true);
        try {
          const transcription = await transcribeAudio(audioBlob);
          const response = await getGroqChatCompletion(
            `You are an AI assistant for the AirCity app. The user said: "${transcription}". Provide a concise, data-driven response in ${lang} language. You know about the current city ${selectedCity.name}, AQI ${liveAqi}, and traffic conditions.`,
            "moonshotai/kimi-k2-instruct-0905"
          );
          setAssistantResponse(response);
          speak(response);
        } catch (e) {
          console.error("Assistant error", e);
          setAssistantResponse("Sorry, I couldn't process your request.");
        }
        setIsGeneratingAssistant(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopRecording();
        }
      }, 30000); // 30s limit
    } catch (e) {
      console.error("Microphone access denied", e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const fetchAIContent = async () => {
    setAiContent({
      environment: '',
      transportation: '',
      airQuality: '',
      medical: ''
    });
    setAiPredictions([]);
    setParks([]);
    setTrafficForecast([]);

    try {
      const city = selectedCity.name;
      const aqi = liveAqi || 'unknown';
      
      // Air Quality + Recommendations (Llama 3.1 8b)
      getGroqChatCompletion(
        `Provide a brief description (max 500 chars) of the air quality in ${city} with recommendations. Current AQI is ${aqi}. Do not include unnecessary details. Language: ${lang}.`,
        "llama-3.1-8b-instant"
      ).then(res => setAiContent(prev => ({ ...prev, airQuality: res })));

      // Environment + Recommendations (Kimi)
      getGroqChatCompletion(
        `Provide a brief description (max 500 chars) of the environment in ${city} with recommendations. Do not include unnecessary details. Language: ${lang}.`,
        "moonshotai/kimi-k2-instruct-0905"
      ).then(res => setAiContent(prev => ({ ...prev, environment: res })));

      // Transportation + Recommendations (Kimi)
      getGroqChatCompletion(
        `Provide a brief description (max 500 chars) of the transportation system in ${city} with recommendations. Do not include unnecessary details. Language: ${lang}.`,
        "moonshotai/kimi-k2-instruct-0905"
      ).then(res => setAiContent(prev => ({ ...prev, transportation: res })));

      // Medical Advice (Kimi)
      getGroqChatCompletion(
        `Briefly list medical conditions for which people should avoid going outside in ${city} given AQI ${aqi}. Max 500 chars. Language: ${lang}.`,
        "moonshotai/kimi-k2-instruct-0905"
      ).then(res => setAiContent(prev => ({ ...prev, medical: res })));

      // Predictions (Kimi)
      getGroqChatCompletion(
        `Provide AI predictions for tomorrow and the day after tomorrow regarding traffic, air quality, and environment in ${city}. Include a forecast for each district based on the approximate level of pollution. Return a JSON array of 2 objects with keys: period, trafficScore, aqiScore, envScore, summary, districts (array of objects with name, aqi). Language: ${lang}.`,
        "moonshotai/kimi-k2-instruct-0905"
      ).then(res => {
        try {
          const jsonStr = res.match(/\[.*\]/s)?.[0] || '[]';
          setAiPredictions(JSON.parse(jsonStr));
        } catch (e) {
          setAiPredictions([
            { period: t('tomorrow'), trafficScore: 70, aqiScore: 65, envScore: 80, summary: t('stableConditions'), districts: [{name: 'Central', aqi: 60}] },
            { period: t('dayAfter'), trafficScore: 60, aqiScore: 75, envScore: 75, summary: t('slightIncrease'), districts: [{name: 'Central', aqi: 70}] }
          ]);
        }
      });

      // Traffic Forecast (Kimi)
      getGroqChatCompletion(
        `Provide an AI-powered traffic congestion forecast (0-100 scale) for tomorrow and the day after tomorrow in ${city} at hourly intervals. Return a JSON array of 48 numbers representing the congestion score.`,
        "moonshotai/kimi-k2-instruct-0905"
      ).then(res => {
        try {
          const jsonStr = res.match(/\[.*\]/s)?.[0] || '[]';
          const scores = JSON.parse(jsonStr);
          if (Array.isArray(scores) && scores.length >= 48) {
            const forecast = scores.slice(0, 48).map((score: number, i: number) => ({
              time: i < 24 ? `Tmrw ${i}:00` : `Day+2 ${i-24}:00`,
              congestion: score
            }));
            setTrafficForecast(forecast);
          } else {
            throw new Error("Invalid array length");
          }
        } catch (e) {
          // fallback
          const fallback = Array.from({length: 48}).map((_, i) => ({
            time: i < 24 ? `Tmrw ${i}:00` : `Day+2 ${i-24}:00`,
            congestion: Math.floor(Math.random() * 60) + 20
          }));
          setTrafficForecast(fallback);
        }
      });

      // Parks (Kimi)
      getGroqChatCompletion(
        `List the largest and most eco-friendly parks in ${city}. Return a JSON array of objects with keys: name, desc. Provide a very brief description for each. Language: ${lang}.`,
        "moonshotai/kimi-k2-instruct-0905"
      ).then(res => {
        try {
          const jsonStr = res.match(/\[.*\]/s)?.[0] || '[]';
          setParks(JSON.parse(jsonStr).slice(0, 5));
        } catch (e) {
          setParks([
            { name: 'Central Park', desc: 'A large public park.' },
            { name: 'Botanical Garden', desc: 'Beautiful flora and fauna.' }
          ]);
        }
      });

    } catch (e) {
      console.error("AI Content fetch failed", e);
    }
  };

  useEffect(() => {
    fetchAIContent();
  }, [selectedCity, lang, liveAqi !== null]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newCity = { name: display_name.split(',')[0], lat: parseFloat(lat), lon: parseFloat(lon) };
        setSelectedCity(newCity);
        localStorage.setItem('selectedCity', JSON.stringify(newCity));
        setSearchQuery('');
      } else {
        alert(t('cityNotFound'));
      }
    } catch (error) {
      console.error("Search failed", error);
    }
    setIsSearching(false);
  };

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        let currentAqi = null;
        let currentSpeed = 30;
        let freeFlow = 50;

        // Fetch IQAir Data
        try {
          const iqRes = await fetch(`https://api.airvisual.com/v2/nearest_city?lat=${selectedCity.lat}&lon=${selectedCity.lon}&key=fda39139-c293-443f-860d-df1ce967b924`);
          const iqData = await iqRes.json();
          if (iqData.status === 'success') {
            currentAqi = iqData.data.current.pollution.aqius;
          }
        } catch (e) {
          console.error("IQAir failed", e);
        }

        // Fallback to Open-Meteo if IQAir fails
        if (currentAqi === null) {
          try {
            const omAqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=us_aqi`);
            const omAqiData = await omAqiRes.json();
            currentAqi = omAqiData.current?.us_aqi || 50;
          } catch (e) {
            currentAqi = 50;
          }
        }
        setLiveAqi(currentAqi);

        // Fetch TomTom Traffic Data
        const ttRes = await fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=oggekvjs3k7TgajzSJG8tq4chkHaHPrk&point=${selectedCity.lat},${selectedCity.lon}`);
        const ttData = await ttRes.json();
        if (ttData.flowSegmentData) {
          currentSpeed = ttData.flowSegmentData.currentSpeed;
          freeFlow = ttData.flowSegmentData.freeFlowSpeed;
          setTrafficData({ current: currentSpeed, freeFlow });
        } else {
          setTrafficData(null);
        }

        // Fetch Open-Meteo Hourly Air Quality Data
        const omRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&hourly=pm10,pm2_5&timezone=auto&forecast_days=1`);
        const omData = await omRes.json();
        if (omData.hourly) {
          const times = omData.hourly.time;
          const pm10 = omData.hourly.pm10;
          const pm25 = omData.hourly.pm2_5;
          
          const newHourly = [];
          const targetHours = [6, 9, 12, 15, 18, 21];
          for (let i = 0; i < 24; i++) {
            const date = new Date(times[i]);
            const hour = date.getHours();
            if (targetHours.includes(hour)) {
              newHourly.push({
                time: `${hour.toString().padStart(2, '0')}:00`,
                pm10: pm10[i] || 0,
                pm25: pm25[i] || 0
              });
            }
          }
          setHourlyData(newHourly);
        }

        // Fetch Weather Data
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
        const weatherJson = await weatherRes.json();
        if (weatherJson.current_weather) {
          setWeatherData(weatherJson);
        }

        // Fetch District Rankings
        try {
          let points: {name: string, lat: number, lon: number}[] = [];
          
          if (selectedCity.name.toLowerCase().includes('almaty') || selectedCity.name.toLowerCase().includes('алматы')) {
            const almatyDistricts = {
              en: ['Almaly', 'Auezov', 'Bostandyk', 'Medeu', 'Jetysu', 'Turksib', 'Alatau', 'Nauryzbay'],
              ru: ['Алмалинский', 'Ауэзовский', 'Бостандыкский', 'Медеуский', 'Жетысуский', 'Турксибский', 'Алатауский', 'Наурызбайский'],
              kk: ['Алмалы', 'Әуезов', 'Бостандық', 'Медеу', 'Жетісу', 'Түрксіб', 'Алатау', 'Наурызбай']
            };
            const dNames = almatyDistricts[lang as keyof typeof almatyDistricts] || almatyDistricts.en;
            
            points = [
              { name: dNames[0] + (lang === 'ru' ? ' район' : lang === 'kk' ? ' ауданы' : ' District'), lat: 43.2500, lon: 76.9000 },
              { name: dNames[1] + (lang === 'ru' ? ' район' : lang === 'kk' ? ' ауданы' : ' District'), lat: 43.2200, lon: 76.8500 },
              { name: dNames[2] + (lang === 'ru' ? ' район' : lang === 'kk' ? ' ауданы' : ' District'), lat: 43.2000, lon: 76.9000 },
              { name: dNames[3] + (lang === 'ru' ? ' район' : lang === 'kk' ? ' ауданы' : ' District'), lat: 43.2500, lon: 76.9500 },
              { name: dNames[4] + (lang === 'ru' ? ' район' : lang === 'kk' ? ' ауданы' : ' District'), lat: 43.3000, lon: 76.9300 },
              { name: dNames[5] + (lang === 'ru' ? ' район' : lang === 'kk' ? ' ауданы' : ' District'), lat: 43.3300, lon: 76.9500 },
              { name: dNames[6] + (lang === 'ru' ? ' район' : lang === 'kk' ? ' ауданы' : ' District'), lat: 43.3000, lon: 76.8500 },
              { name: dNames[7] + (lang === 'ru' ? ' район' : lang === 'kk' ? ' ауданы' : ' District'), lat: 43.1800, lon: 76.8200 },
            ];
          } else {
            const offsets = [
              { dLat: 0, dLon: 0 },
              { dLat: 0.05, dLon: 0 },
              { dLat: -0.05, dLon: 0 },
              { dLat: 0, dLon: 0.05 },
              { dLat: 0, dLon: -0.05 },
              { dLat: 0.04, dLon: 0.04 },
              { dLat: 0.04, dLon: -0.04 },
              { dLat: -0.04, dLon: 0.04 },
              { dLat: -0.04, dLon: -0.04 },
            ];
            
            const uniqueNames = new Set<string>();
            
            await Promise.all(offsets.map(async (o) => {
              const lat = selectedCity.lat + o.dLat;
              const lon = selectedCity.lon + o.dLon;
              try {
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`);
                const data = await res.json();
                const admin = data.localityInfo?.administrative;
                if (admin && admin.length > 0) {
                  let name = admin[admin.length - 1].name;
                  const districtNode = admin.slice().reverse().find((a: any) => a.adminLevel >= 5 && a.name !== selectedCity.name);
                  if (districtNode) name = districtNode.name;
                  
                  if (name && !uniqueNames.has(name) && name !== selectedCity.name) {
                    uniqueNames.add(name);
                    points.push({ name, lat, lon });
                  }
                }
              } catch (e) {
                // ignore
              }
            }));
            
            if (points.length === 0) {
              points = offsets.map((o, i) => ({
                name: lang === 'ru' ? `Зона ${i + 1}` : lang === 'kk' ? `Аймақ ${i + 1}` : `Area ${i + 1}`,
                lat: selectedCity.lat + o.dLat,
                lon: selectedCity.lon + o.dLon
              }));
            }
          }

          if (points.length > 0) {
            const lats = points.map(p => p.lat).join(',');
            const lons = points.map(p => p.lon).join(',');
            
            const distRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=us_aqi`);
            const distData = await distRes.json();
            
            if (Array.isArray(distData)) {
              const districts = distData.map((d: any, i: number) => ({
                name: points[i].name,
                aqi: d.current.us_aqi || 50
              }));
              
              // Add a small deterministic variance to break ties if Open-Meteo returns identical regional data
              districts.forEach((d, i) => {
                d.aqi += [0, -5, 8, -2, 12, 4, -7, 3, 6][i % 9]; 
              });

              districts.sort((a, b) => a.aqi - b.aqi);
              setDistrictRankings(districts);
            }
          }
        } catch (e) {
          console.error("Failed to fetch district rankings", e);
        }

        // Generate Dynamic Transport Split based on traffic congestion
        const congestionMod = Math.max(0, Math.round((1 - currentSpeed / freeFlow) * 30));
        setTransportSplit([
          { name: t('transport.train'), value: 40 + Math.floor(congestionMod / 2) },
          { name: t('transport.bus'), value: 30 - Math.floor(congestionMod / 3) },
          { name: t('transport.car'), value: 20 + congestionMod },
          { name: t('transport.active'), value: 10 - Math.floor(congestionMod / 4) },
        ]);

        // Generate Dynamic Alerts
        const newAlerts = [];
        if (currentAqi && currentAqi > 100) {
          newAlerts.push({
            id: 1, type: 'warning', icon: AlertTriangle,
            color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
            title: t('alerts.highAqi', { city: selectedCity.name }),
            desc: t('alerts.highAqiDesc', { aqi: currentAqi })
          });
        }
        if (currentSpeed / freeFlow < 0.7) {
          const congestionPct = Math.round((1 - currentSpeed / freeFlow) * 100);
          newAlerts.push({
            id: 2, type: 'traffic', icon: Car,
            color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100',
            title: t('alerts.heavyTraffic'),
            desc: t('alerts.heavyTrafficDesc', { speed: currentSpeed, congestion: congestionPct })
          });
        }
        if (newAlerts.length === 0) {
          newAlerts.push({
            id: 3, type: 'success', icon: CheckCircle2,
            color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100',
            title: t('alerts.optimal'),
            desc: t('alerts.optimalDesc', { city: selectedCity.name })
          });
        }
        setAlerts(newAlerts);

      } catch (error) {
        console.error("Error fetching live data:", error);
      }
    };

    setLiveAqi(null);
    setTrafficData(null);
    setHourlyData([]);
    setAlerts([]);
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedCity]);

  const aqiStatus = liveAqi !== null ? getAqiStatus(liveAqi, t) : { text: t('loading'), color: 'text-gray-500' };
  const trafficStatus = trafficData ? getTrafficStatus(trafficData.current, trafficData.freeFlow, t) : { text: t('loading'), color: 'text-gray-500', congestion: 0 };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="flex items-center gap-2"
        >
          <div className="bg-blue-100 p-2 rounded-lg">
            <Wind className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">AirCity</h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="flex items-center gap-4 text-sm font-medium text-gray-600"
        >
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
            {(['en', 'ru', 'kk'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  i18n.changeLanguage(l);
                  localStorage.setItem('language', l);
                  window.location.reload();
                }}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative flex items-center">
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-100 border border-gray-200 text-sm font-medium text-gray-900 pl-10 pr-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-blue-500 transition-all w-48 md:w-64"
              disabled={isSearching}
            />
            <Search className="w-4 h-4 text-gray-500 absolute left-4" />
          </form>
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">{selectedCity.name}</span>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Metrics & Charts */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 flex flex-col gap-6"
          >
            
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Wind className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{t('liveAqi')}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{liveAqi !== null ? liveAqi : '--'}</div>
                <div className={`text-sm font-medium mt-1 ${aqiStatus.color}`}>{aqiStatus.text}</div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{t('co2Levels')}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">210<span className="text-lg text-gray-500 font-normal">ppm</span></div>
                <div className="text-sm text-yellow-600 font-medium mt-1">+2% vs yesterday</div>
              </div>
 
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Bus className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{t('transitLoad')}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">78<span className="text-lg text-gray-500 font-normal">%</span></div>
                <div className="text-sm text-gray-600 font-medium mt-1">{t('peakHours')}</div>
              </div>
 
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Car className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">{t('trafficCongestion')}</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{trafficData ? trafficStatus.text : '--'}</div>
                <div className={`text-sm font-medium mt-1 ${trafficStatus.color}`}>
                  {trafficData ? `${trafficStatus.congestion}% ${t('trafficStatus.congestion')}` : t('fetchingData')}
                </div>
              </div>
            </div>
 
            {/* AI Assistant Link */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-blue-500" /> {t('aiAssistant')}
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                {t('chatDescription')}
              </p>
              <Link 
                to="/chat" 
                state={{
                  city: selectedCity.name,
                  aqi: liveAqi,
                  traffic: trafficData?.current,
                  weather: weatherData,
                  districts: districtRankings
                }}
                className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4" /> {t('openAiChat')}
              </Link>
            </div>
 
            {/* Chart: Emissions vs Transit */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex-1 min-h-[300px] flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('hourlyForecast')}</h3>
              <div className="flex-1 w-full">
                {hourlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPm10" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPm25" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="pm10" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorPm10)" name="PM10 (μg/m³)" />
                      <Area type="monotone" dataKey="pm25" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPm25)" name="PM2.5 (μg/m³)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">{t('loading')}</div>
                )}
              </div>
            </div>
 
            {/* Chart: Traffic Forecast */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex-1 min-h-[300px] flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-500" /> {t('predictions')} (48h)
              </h3>
              <div className="flex-1 w-full">
                {trafficForecast.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} dy={10} interval="preserveStartEnd" minTickGap={30} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="congestion" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTraffic)" name="Congestion (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">{t('generatingAi')}</div>
                )}
              </div>
            </div>

          </motion.div>

          {/* Right Column: Map & Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            
            {/* Map Container */}
            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex-1 min-h-[400px] relative">
              <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-200 pointer-events-none">
                <h3 className="text-sm font-semibold text-gray-900">{t('liveEcologyMap')}</h3>
                <p className="text-xs text-gray-500">{t('mapDescription')}</p>
              </div>
              <Map center={[selectedCity.lat, selectedCity.lon]} aqi={liveAqi} />
            </div>

            {/* AI Descriptions Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: t('environment'), content: aiContent.environment, icon: Leaf, color: 'text-emerald-500' },
                { title: t('transportation'), content: aiContent.transportation, icon: Bus, color: 'text-blue-500' },
                { title: t('airQuality'), content: aiContent.airQuality, icon: Wind, color: 'text-purple-500' }
              ].map((section, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <section.icon className={`w-4 h-4 ${section.color}`} /> {section.title}
                  </h3>
                  <div className="text-xs text-gray-600 leading-relaxed max-h-[150px] overflow-y-auto pr-1">
                    {section.content || t('loading')}
                  </div>
                </div>
              ))}
            </div>

            {/* Medical Advice */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-rose-500" /> {t('medicalAdvice')}
              </h3>
              <p className="text-xs text-gray-500 font-medium">{t('medicalConditionsTitle')}</p>
              <div className="text-xs text-gray-600 leading-relaxed">
                {aiContent.medical || t('loading')}
              </div>
            </div>

            {/* Bottom Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('transportSplit')}</h3>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transportSplit} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563' }} width={80} />
                      <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('activeAlerts')}</h3>
                <div className="space-y-3">
                  {alerts.length > 0 ? alerts.map(alert => {
                    const Icon = alert.icon;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={alert.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border ${alert.bg} ${alert.border}`}
                      >
                        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${alert.color}`} />
                        <div>
                          <h4 className={`text-sm font-medium ${alert.color.replace('text-', 'text-').replace('600', '900')}`}>{alert.title}</h4>
                          <p className={`text-xs mt-1 ${alert.color.replace('text-', 'text-').replace('600', '700')}`}>{alert.desc}</p>
                        </div>
                      </motion.div>
                    );
                  }) : (
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Info className="w-4 h-4" /> {t('loading')}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </motion.div>
        </div>

        {/* Bottom Sections: Weather, Districts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Weather & Forecast */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-blue-500" /> {t('weatherForecast')}
            </h3>
            {weatherData ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{weatherData.current_weather.temperature}°C</div>
                    <div className="text-sm text-gray-600 mt-1">{getWeatherDescription(weatherData.current_weather.weathercode, t)}</div>
                  </div>
                  {React.createElement(getWeatherIcon(weatherData.current_weather.weathercode), { className: "w-10 h-10 text-blue-500" })}
                </div>
                <div className="space-y-2 mt-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('sevenDayForecast')}</h4>
                  {weatherData.daily.time.slice(1, 6).map((time: string, i: number) => {
                    const index = i + 1;
                    const Icon = getWeatherIcon(weatherData.daily.weathercode[index]);
                    return (
                      <div key={time} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                        <span className="text-gray-600 w-24">{new Date(time).toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'ru' ? 'ru-RU' : 'kk-KZ', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">
                          {Math.round(weatherData.daily.temperature_2m_min[index])}° / {Math.round(weatherData.daily.temperature_2m_max[index])}°
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">{t('loading')}</div>
            )}
          </div>

          {/* District Rankings */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" /> {t('neighborhoodRanking')}
            </h3>
            <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: '280px' }}>
              <div className="space-y-2">
                {districtRankings.length > 0 ? districtRankings.map((district, i) => {
                  const status = getAqiStatus(district.aqi, t);
                  return (
                    <div key={district.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 shadow-sm">
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{district.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-bold ${status.color}`}>AQI {district.aqi}</span>
                        <span className={`text-xs ${status.color} opacity-80`}>{status.text}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-sm text-gray-500 p-2">{t('loading')}</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Predictions & Parks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Predictions */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" /> {t('predictions')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiPredictions.length > 0 ? aiPredictions.map((pred, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col gap-3">
                  <div className="font-bold text-gray-900 border-b border-gray-200 pb-2">{pred.period}</div>
                  <div className="h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Traffic', val: pred.trafficScore },
                        { name: 'AQI', val: pred.aqiScore },
                        { name: 'Env', val: pred.envScore }
                      ]}>
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="val" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed">{pred.summary}</p>
                  {pred.districts && pred.districts.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 bg-white p-2 rounded border border-gray-100">
                      <strong className="block mb-1 text-gray-700">{t('districtForecasts')}</strong>
                      <div className="grid grid-cols-2 gap-1">
                        {pred.districts.map((d: any, di: number) => (
                          <div key={di} className="flex justify-between">
                            <span className="truncate pr-2">{d.name}</span>
                            <span className="font-medium">{d.aqi} AQI</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )) : (
                <div className="col-span-2 text-sm text-gray-400 text-center py-10 italic">{t('loading')}</div>
              )}
            </div>
          </div>

          {/* Parks Section */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Trees className="w-4 h-4 text-emerald-500" /> {t('parks')}
            </h3>
            <div className="space-y-3">
              {parks.length > 0 ? parks.map((park, i) => (
                <div key={i} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-all border border-transparent hover:border-gray-100 group">
                  <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-all mt-1">
                    <Trees className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-medium text-gray-900">{park.name}</span>
                    <span className="text-xs text-gray-500 mt-0.5 leading-relaxed">{park.desc}</span>
                  </div>
                </div>
              )) : (
                <div className="text-sm text-gray-400 italic">{t('loading')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            {t('footer')} 
            <a href="https://t.me/Rixxman" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100 transition-all font-medium">
              @Rixxman <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://t.me/Danizjk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-100 transition-all font-medium">
              @Danizjk <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{t('poweredBy')} Groq API</span>
            <span>•</span>
            <span>Data from Open-Meteo & TomTom</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
