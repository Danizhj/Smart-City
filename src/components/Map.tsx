import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TOMTOM_KEY = import.meta.env.VITE_TOMTOM_KEY || 'oggekvjs3k7TgajzSJG8tq4chkHaHPrk';

function getAqiColor(aqi: number) {
  if (aqi <= 50) return '#22c55e'; // green
  if (aqi <= 100) return '#eab308'; // yellow
  if (aqi <= 150) return '#f97316'; // orange
  if (aqi <= 200) return '#ef4444'; // red
  if (aqi <= 300) return '#a855f7'; // purple
  return '#881337'; // rose
}

const createAqiIcon = (aqi: number) => {
  const color = getAqiColor(aqi);
  const html = `
    <div style="
      background: radial-gradient(circle, ${color}33 0%, ${color}00 70%);
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${color};
      font-weight: 700;
      font-size: 16px;
      text-shadow: 0 0 4px rgba(255,255,255,0.8);
      margin-left: -60px;
      margin-top: -60px;
    ">
      ${aqi}
    </div>
  `;
  return L.divIcon({
    html,
    className: 'custom-aqi-heatmap-icon',
    iconSize: [0, 0],
  });
};

const sunSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#eab308" stroke="#ca8a04" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
const cloudSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#f3f4f6" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
const rainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#dbeafe" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M16 23v-2"/><path d="M8 23v-2"/><path d="M12 23v-2"/></svg>`;

const createWeatherIcon = (type: 'sun' | 'cloud' | 'rain') => {
  const svg = type === 'sun' ? sunSvg : type === 'cloud' ? cloudSvg : rainSvg;
  return L.divIcon({
    html: `<div style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${svg}</div>`,
    className: 'custom-weather-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function Map({ center, aqi }: { center: [number, number], aqi: number | null }) {
  function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
  }

  const simulatedZones = useMemo(() => {
    if (aqi === null) return [];
    return [
      { lat: center[0], lon: center[1], aqi: aqi },
      { lat: center[0] + 0.015, lon: center[1] + 0.02, aqi: Math.max(0, aqi - 12) },
      { lat: center[0] - 0.01, lon: center[1] - 0.015, aqi: aqi + 18 },
      { lat: center[0] + 0.02, lon: center[1] - 0.01, aqi: Math.max(0, aqi - 5) },
      { lat: center[0] - 0.02, lon: center[1] + 0.01, aqi: aqi + 8 },
    ];
  }, [center, aqi]);

  const weatherZones = useMemo(() => {
    return [
      { lat: center[0] + 0.03, lon: center[1] + 0.03, type: 'sun' as const, temp: 24 },
      { lat: center[0] - 0.02, lon: center[1] - 0.04, type: 'cloud' as const, temp: 22 },
      { lat: center[0] + 0.04, lon: center[1] - 0.02, type: 'rain' as const, temp: 19 },
    ];
  }, [center]);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <MapUpdater center={center} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.Overlay checked name="Traffic">
            <TileLayer
              attribution='&copy; TomTom'
              url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${TOMTOM_KEY}&thickness=2`}
              minZoom={12}
            />
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Ecology">
            <LayerGroup>
              {simulatedZones.map((zone, i) => (
                <Marker key={i} position={[zone.lat, zone.lon]} icon={createAqiIcon(zone.aqi)}>
                  <Popup>
                    <div className="font-sans text-center">
                      <h3 className="font-semibold text-gray-900">Air Quality</h3>
                      <p className="text-sm text-gray-600">AQI: <span className="font-bold" style={{ color: getAqiColor(zone.aqi) }}>{zone.aqi}</span></p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="Weather">
            <LayerGroup>
              {weatherZones.map((zone, i) => (
                <Marker key={i} position={[zone.lat, zone.lon]} icon={createWeatherIcon(zone.type)}>
                  <Popup>
                    <div className="font-sans text-center">
                      <h3 className="font-semibold text-gray-900 capitalize">{zone.type}</h3>
                      <p className="text-sm text-gray-600">Temp: <span className="font-bold">{zone.temp}°C</span></p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
      </MapContainer>
    </div>
  );
}
