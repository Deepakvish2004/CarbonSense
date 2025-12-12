import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function LocationInsights() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [aiInsight, setAiInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [savedMsg, setSavedMsg] = useState("");
  const [manualQuery, setManualQuery] = useState("");

  const mapRef = useRef(null);

  const WEATHER_KEY = import.meta.env.VITE_WEATHER_KEY;
  const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchReports();
  }, []);

  // ----------------------------------------------
  // REAL AQI BREAKPOINT TABLES (Govt Standard)
  // ----------------------------------------------
  const breakpoints = {
    pm25: [
      { Clow: 0, Chigh: 12, Ilow: 0, Ihigh: 50 },
      { Clow: 12.1, Chigh: 35.4, Ilow: 51, Ihigh: 100 },
      { Clow: 35.5, Chigh: 55.4, Ilow: 101, Ihigh: 150 },
      { Clow: 55.5, Chigh: 150.4, Ilow: 151, Ihigh: 200 },
      { Clow: 150.5, Chigh: 250.4, Ilow: 201, Ihigh: 300 },
      { Clow: 250.5, Chigh: 350.4, Ilow: 301, Ihigh: 400 },
      { Clow: 350.5, Chigh: 500.4, Ilow: 401, Ihigh: 500 }
    ],
    pm10: [
      { Clow: 0, Chigh: 54, Ilow: 0, Ihigh: 50 },
      { Clow: 55, Chigh: 154, Ilow: 51, Ihigh: 100 },
      { Clow: 155, Chigh: 254, Ilow: 101, Ihigh: 150 },
      { Clow: 255, Chigh: 354, Ilow: 151, Ihigh: 200 },
      { Clow: 355, Chigh: 424, Ilow: 201, Ihigh: 300 },
      { Clow: 425, Chigh: 504, Ilow: 301, Ihigh: 400 },
      { Clow: 505, Chigh: 604, Ilow: 401, Ihigh: 500 }
    ],
  };

  // Convert pollutant concentration → AQI
  function calcAQI(C, bp) {
    for (let range of bp) {
      if (C >= range.Clow && C <= range.Chigh) {
        return Math.round(
          ((range.Ihigh - range.Ilow) / (range.Chigh - range.Clow)) *
            (C - range.Clow) +
            range.Ilow
        );
      }
    }
    return null; // if outside range
  }

  // Compute overall AQI using PM2.5 + PM10
  function computeRealAQI(components) {
    const pm25 = components.pm2_5;
    const pm10 = components.pm10;

    const aqi25 = calcAQI(pm25, breakpoints.pm25);
    const aqi10 = calcAQI(pm10, breakpoints.pm10);

    return Math.max(aqi25 || 0, aqi10 || 0);
  }

  // ----------------- MANUAL SEARCH -----------------
  const manualSearch = async () => {
    if (!manualQuery.trim()) {
      alert("Please enter a location.");
      return;
    }

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualQuery)}`
      );

      const geoData = await geoRes.json();
      if (!geoData.length) return alert("Location not found.");

      fetchData(parseFloat(geoData[0].lat), parseFloat(geoData[0].lon));
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------- AUTO DETECT -----------------
  const detectLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation unsupported.");

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchData(pos.coords.latitude, pos.coords.longitude),
      () => alert("Permission denied.")
    );
  };

  // ----------------- FETCH WEATHER + REAL AQI -----------------
  const fetchData = async (lat, lon) => {
    setLoading(true);
    setSavedMsg("");

    try {
      // Weather
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric`
      );
      const weatherData = await weatherRes.json();

      const city = weatherData.name || "Unknown";

      // Air pollution (with PM values)
      const aqiRes = await fetch(
        `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}`
      );
      const aqiJson = await aqiRes.json();

      const components = aqiJson?.list?.[0]?.components;
      const realAQI = computeRealAQI(components);

      setAqi(realAQI);

      // Compute risk score
      const { score, label } = computeRisk({
        temperature: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        aqi: realAQI,
      });

      setLocation({
        lat,
        lon,
        city,
        temp: weatherData.main.temp,
        humidity: weatherData.main.humidity,
        aqi: realAQI,
        riskScore: score,
        riskLabel: label,
      });

      if (mapRef.current) mapRef.current.setView([lat, lon], 12);
    } catch (err) {
      console.error(err);
      alert("Error fetching location data.");
    }

    setLoading(false);
  };

  // ----------------- RISK ALGORITHM -----------------
  function computeRisk({ temperature, humidity, aqi }) {
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
  }

  // ----------------- AI TEXT CLEANING -----------------
  function formatAI(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br>");
  }

  // ----------------- SAVE REPORT -----------------
  const saveReport = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
      const userId = userInfo?._id;
      const token = localStorage.getItem("token");

      const res = await fetch(`${backendBase}/api/location/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          userId,
          ...location,
          aiInsight,
        }),
      });

      const data = await res.json();
      setSavedMsg(data.success ? "Report saved successfully." : "Failed to save report.");
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------- FETCH REPORT HISTORY -----------------
  const fetchReports = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
      const userId = userInfo?._id || "";

      const res = await fetch(`${backendBase}/api/location/reports/${userId}`);
      const data = await res.json();

      if (data.success) setReports(data.reports);
    } catch (err) {
      console.error(err);
    }
  };

  const riskBadgeClass = (label) => {
    if (label === "Low") return "bg-green-200 text-green-800";
    if (label === "Moderate") return "bg-yellow-200 text-yellow-800";
    if (label === "High") return "bg-orange-200 text-orange-900";
    return "bg-red-200 text-red-900";
  };

  // ----------------- UI -----------------
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold">🌍 Location-Based Carbon Analysis</h1>

      {/* Manual Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search location manually..."
          className="border px-3 py-2 rounded w-80"
          value={manualQuery}
          onChange={(e) => setManualQuery(e.target.value)}
        />
        <button onClick={manualSearch} className="px-5 py-2 bg-blue-600 text-white rounded">
          Search
        </button>
      </div>

      {/* Auto Detect */}
      <button onClick={detectLocation} className="px-6 py-3 bg-orange-500 text-white rounded-lg">
        Detect My Location
      </button>

      {loading && <p>Loading data...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <div>
          {location ? (
            <div className="p-4 bg-gray-50 rounded shadow">
              <h2 className="text-xl font-semibold">📍 {location.city}</h2>
              <p>🌡 Temperature: {location.temp}°C</p>
              <p>💧 Humidity: {location.humidity}%</p>
              <p>🌫 AQI (Real): {location.aqi}</p>

              <div className={`inline-block px-3 py-1 mt-3 rounded ${riskBadgeClass(location.riskLabel)}`}>
                {location.riskLabel} — {location.riskScore}
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={saveReport} className="px-4 py-2 bg-green-600 text-white rounded">
                  Save Report
                </button>
                <button onClick={fetchReports} className="px-4 py-2 bg-gray-200 rounded">
                  Refresh
                </button>
              </div>

              {savedMsg && <p className="mt-2 text-sm">{savedMsg}</p>}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded">No location selected.</div>
          )}

          {/* AI Insight */}
          {aiInsight && (
            <div className="mt-4 p-4 bg-white rounded shadow">
              <h3 className="font-semibold mb-2">🤖 AI Insight</h3>
              <div dangerouslySetInnerHTML={{ __html: aiInsight }} className="prose max-w-none"></div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div>
          {/* MAP */}
          <div className="h-80 rounded shadow overflow-hidden">
            {location ? (
              <MapContainer
                center={[location.lat, location.lon]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                whenCreated={(map) => (mapRef.current = map)}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[location.lat, location.lon]}>
                  <Popup>
                    {location.city}<br />
                    AQI: {location.aqi}
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Map will appear here.
              </div>
            )}
          </div>

          {/* REPORT LIST */}
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">Saved Reports</h4>

            {reports.length === 0 && <p>No reports yet.</p>}

            <ul className="space-y-2 max-h-60 overflow-auto">
              {reports.map((r) => (
                <li key={r._id} className="p-2 bg-white rounded shadow">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{r.locationName}</p>
                      <p className="text-xs">
                        Temp: {r.temperature}°C • Humidity: {r.humidity}%
                      </p>
                    </div>
                    <div className="text-xs text-right">
                      {new Date(r.createdAt).toLocaleString()}
                      <br />
                      {r.riskLabel} ({r.riskScore})
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
