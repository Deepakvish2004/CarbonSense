import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* ---------------- LEAFLET ICON FIX ---------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LocationInsights() {
  /* ---------------- STATES ---------------- */
  const [location, setLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [manualQuery, setManualQuery] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [aiInsight, setAiInsight] = useState("");

  const WEATHER_KEY = import.meta.env.VITE_WEATHER_KEY;
  const backendBase =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  /* ---------------- LOAD REPORTS ONCE ---------------- */
  useEffect(() => {
    fetchReports();
  }, []);

  /* ---------------- AQI BREAKPOINTS ---------------- */
  const breakpoints = {
    pm25: [
      { Clow: 0, Chigh: 12, Ilow: 0, Ihigh: 50 },
      { Clow: 12.1, Chigh: 35.4, Ilow: 51, Ihigh: 100 },
      { Clow: 35.5, Chigh: 55.4, Ilow: 101, Ihigh: 150 },
      { Clow: 55.5, Chigh: 150.4, Ilow: 151, Ihigh: 200 },
      { Clow: 150.5, Chigh: 250.4, Ilow: 201, Ihigh: 300 },
      { Clow: 250.5, Chigh: 350.4, Ilow: 301, Ihigh: 400 },
      { Clow: 350.5, Chigh: 500.4, Ilow: 401, Ihigh: 500 },
    ],
    pm10: [
      { Clow: 0, Chigh: 54, Ilow: 0, Ihigh: 50 },
      { Clow: 55, Chigh: 154, Ilow: 51, Ihigh: 100 },
      { Clow: 155, Chigh: 254, Ilow: 101, Ihigh: 150 },
      { Clow: 255, Chigh: 354, Ilow: 151, Ihigh: 200 },
      { Clow: 355, Chigh: 424, Ilow: 201, Ihigh: 300 },
      { Clow: 425, Chigh: 504, Ilow: 301, Ihigh: 400 },
      { Clow: 505, Chigh: 604, Ilow: 401, Ihigh: 500 },
    ],
  };

  const calcAQI = (C, bp) => {
    for (let r of bp) {
      if (C >= r.Clow && C <= r.Chigh) {
        return Math.round(
          ((r.Ihigh - r.Ilow) / (r.Chigh - r.Clow)) *
            (C - r.Clow) +
            r.Ilow
        );
      }
    }
    return null;
  };

  const computeRealAQI = (c) =>
    Math.max(
      calcAQI(c.pm2_5, breakpoints.pm25) || 0,
      calcAQI(c.pm10, breakpoints.pm10) || 0
    );

  /* ---------------- RISK SCORE ---------------- */
  const computeRisk = ({ temperature, humidity, aqi }) => {
    let score = 0;

    if (temperature < 18) score += 10;
    else if (temperature > 30) score += 20;

    if (humidity < 30) score += 10;
    else if (humidity > 60) score += 15;

    if (aqi <= 50) score += 2;
    else if (aqi <= 100) score += 10;
    else if (aqi <= 200) score += 25;
    else if (aqi <= 300) score += 35;
    else score += 50;

    if (score < 20) return { score, label: "Low" };
    if (score < 40) return { score, label: "Moderate" };
    if (score < 65) return { score, label: "High" };
    return { score, label: "Very High" };
  };

  /* ---------------- FETCH WEATHER + AQI ---------------- */
  const fetchData = async (lat, lon) => {
    setLoading(true);
    setSavedMsg("");

    try {
      const wRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`
      );
      const wData = await wRes.json();

      const aqiRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}`
      );
      const aqiData = await aqiRes.json();

      const components = aqiData.list[0].components;
      const realAQI = computeRealAQI(components);

      const { score, label } = computeRisk({
        temperature: wData.main.temp,
        humidity: wData.main.humidity,
        aqi: realAQI,
      });

      setMapCenter([lat, lon]);
      setLocation({
        lat,
        lon,
        locationName: wData.name || "Unknown",
        temp: wData.main.temp,
        humidity: wData.main.humidity,
        aqi: realAQI,
        riskScore: score,
        riskLabel: label,
      });

      setAiInsight(
        `Air quality in <b>${wData.name}</b> is <b>${label}</b>. AQI is <b>${realAQI}</b>.`
      );
    } catch {
      alert("Failed to fetch location data");
    }

    setLoading(false);
  };

  /* ---------------- MANUAL SEARCH ---------------- */
  const manualSearch = async () => {
    if (!manualQuery.trim()) return alert("Enter location");

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        manualQuery
      )}`
    );
    const data = await res.json();
    if (!data.length) return alert("Location not found");

    fetchData(+data[0].lat, +data[0].lon);
  };

  /* ---------------- AUTO DETECT ---------------- */
  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchData(pos.coords.latitude, pos.coords.longitude),
      () => alert("Permission denied")
    );
  };

  /* ---------------- SAVE REPORT ---------------- */
  const saveReport = async () => {
    if (!location) return;

    const user = JSON.parse(localStorage.getItem("userInfo") || "null");

    const res = await fetch(`${backendBase}/api/location/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user?._id, ...location }),
    });

    const data = await res.json();
    if (data.success) {
      setSavedMsg("Report saved successfully.");
      fetchReports();
    }
  };

  /* ---------------- FETCH REPORTS ---------------- */
  const fetchReports = async () => {
    const user = JSON.parse(localStorage.getItem("userInfo") || "null");
    if (!user?._id) return;

    const res = await fetch(
      `${backendBase}/api/location/reports/${user._id}`
    );
    const data = await res.json();
    if (data.success) setReports(data.reports);
  };

  /* ---------------- DELETE REPORT ---------------- */
  const deleteReport = async (id) => {
    await fetch(`${backendBase}/api/location/report/${id}`, {
      method: "DELETE",
    });
    setReports((prev) => prev.filter((r) => r._id !== id));
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">
        🌍 Location-Based Carbon Analysis
      </h1>

      <div className="flex gap-3">
        <input
          className="border px-3 py-2 rounded w-80"
          placeholder="Search location..."
          value={manualQuery}
          onChange={(e) => setManualQuery(e.target.value)}
        />
        <button
          onClick={manualSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Search
        </button>
      </div>

      <button
        onClick={detectLocation}
        className="px-6 py-3 bg-orange-500 text-white rounded"
      >
        Detect My Location
      </button>

      {loading && <p>Loading...</p>}

      {/* ---------- SQUARE MAP WITH OVERLAY (FIXED) ---------- */}
      <div className="relative w-1/2 aspect-square rounded-xl overflow-hidden shadow-lg">
        <MapContainer
          key={mapCenter.join(",")}
          center={mapCenter}
          zoom={12}
          className="z-0"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {location && (
            <Marker position={mapCenter}>
              <Popup>
                {location.locationName}
                <br />
                AQI: {location.aqi}
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {location && (
          <div className="absolute bottom-4 left-4 right-4 
                          bg-white/95 backdrop-blur-md 
                          rounded-lg p-4 shadow-xl
                          z-20">
            <h3 className="text-lg font-semibold">
              📍 {location.locationName}
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <p>🌫 AQI: <b>{location.aqi}</b></p>
              <p>🌡 Temp: <b>{location.temp}°C</b></p>
              <p>💧 Humidity: <b>{location.humidity}%</b></p>
              <p>⚠️ Risk: <b>{location.riskLabel}</b></p>
            </div>
          </div>
        )}
      </div>

      {location && (
        <button
          onClick={saveReport}
          className="px-6 py-3 bg-green-600 text-white rounded"
        >
          Save Report
        </button>
      )}

      {savedMsg && <p>{savedMsg}</p>}

      {aiInsight && (
        <div
          className="p-4 bg-white rounded shadow"
          dangerouslySetInnerHTML={{ __html: aiInsight }}
        />
      )}

      <div className="p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Saved Reports</h3>
        {reports.length === 0 && <p>No reports yet</p>}
        <ul className="space-y-2">
          {reports.map((r) => (
            <li
              key={r._id}
              className="p-2 bg-white rounded shadow flex justify-between"
            >
              <div>
                <p className="font-medium">{r.locationName}</p>
                <p className="text-xs">
                  AQI: {r.aqi} | {r.riskLabel}
                </p>
              </div>
              <button
                onClick={() => deleteReport(r._id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
