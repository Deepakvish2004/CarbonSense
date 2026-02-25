import React, { useState, useEffect } from "react";
import axios from "axios";

export default function WastePage() {
  const [form, setForm] = useState({
    facility: "",
    year: "",
    month: "",
    wasteType: "",
    treatmentType: "",
    unit: "",
    amount: "",
  });

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const token = userInfo?.token;


  const currentYear = new Date().getFullYear();
const years = [];

for (let year = currentYear; year >= 2020; year--) {
  years.push(year.toString());
}

  // -----------------------------
  // HANDLE SUBMIT
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("User not logged in. Please login.");
      return;
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(
        "http://localhost:5000/api/waste/calculate",
        form,
        config
      );

      alert("✅ Waste record added!");

      // Reset form
      setForm({
        facility: "",
        year: "",
        month: "",
        wasteType: "",
        treatmentType: "",
        unit: "",
        amount: "",
      });

      fetchRecords();
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save record.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // FETCH HISTORY
  // -----------------------------
  const fetchRecords = async () => {
    if (!token) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(
        "http://localhost:5000/api/waste/history",
        config
      );
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to fetch:", err.message);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // -----------------------------
  // DELETE RECORD
  // -----------------------------
  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/waste/${id}`, config);
      fetchRecords();
    } catch (err) {
      alert("Error deleting record");
    }
  };

  // -----------------------------
  // CALCULATE DASHBOARD TOTAL
  // -----------------------------
  const totalCO2 = records.reduce((sum, r) => sum + r.co2Emission, 0);

  return (
    <div className="min-h-screen bg-green-50 p-6 box-border ">
      <h1 className="text-2xl font-bold  text-green-700 mb-6">
        💻 Computer Waste Emission Tracker
      </h1>

      {/* ----------------------------------  
          FORM SECTION  
      ---------------------------------- */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto"
      >
        {[
          { name: "facility", label: "Facility", type: "select", options: ["Home", "Office", "Lab"] },
          { name: "year", label: "Year", type: "select", options: years },

          {
            name: "month",
            label: "Month",
            type: "select",
            options: [
              "January","February","March","April","May","June",
              "July","August","September","October","November","December",
            ],
          },
          {
            name: "wasteType",
            label: "Waste Type",
            type: "select",
            options: ["Laptop", "Desktop", "Monitor", "Battery", "Cable", "Motherboard"],
          },
          {
            name: "treatmentType",
            label: "Treatment Type",
            type: "select",
            options: ["Recycled", "Disposed", "Donated", "Reused"],
          },
          { name: "unit", label: "Unit", type: "select", options: ["Pieces", "Kg", "Tons"] },
          { name: "amount", label: "Amount", type: "number" },
        ].map((field, i) => (
          <div key={i}>
            <label className="block text-green-800 font-medium mb-1">
              {field.label}*
            </label>

            {field.type === "select" ? (
              <select
                required
                value={form[field.name]}
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-400"
              >
                <option value="">Choose {field.label}</option>
                {field.options.map((opt, idx) => (
                  <option key={idx}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                required
                value={form[field.name]}
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-400"
                placeholder={`Enter ${field.label}`}
              />
            )}
          </div>
        ))}

        <div className="md:col-span-2 text-center mt-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Add Record"}
          </button>
        </div>
      </form>

      {/* ----------------------------------  
          TOTAL EMISSION CARD  
      ---------------------------------- */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-green-100 border border-green-300 p-4 rounded-lg shadow text-center">
          <h2 className="text-lg font-semibold text-green-700">
            🌍 Total Emission from Waste
          </h2>
          <p className="text-xl font-bold text-green-800 mt-1">
            {totalCO2.toFixed(2)} kg CO₂
          </p>
        </div>
      </div>

      {/* ----------------------------------  
          TREATMENT INFO  
      ---------------------------------- */}
      <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded-lg shadow-md border border-green-200">
        <h2 className="text-lg font-semibold text-green-700 mb-3">
          ♻️ Treatment Type Impact on CO₂ Emission
        </h2>
        <p className="text-gray-600 mb-4">
          Different disposal methods affect CO₂ emissions differently.
        </p>
      </div>

      {/* ----------------------------------  
          RECORD LIST  
      ---------------------------------- */}
      <div className="max-w-4xl mx-auto mt-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-green-700 mb-2">
          🗂️ Your Waste Records
        </h2>

        {records.length === 0 ? (
          <p className="text-gray-500 text-center">No records found yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {records.map((r) => (
              <li key={r._id} className="py-3 flex justify-between items-center">
                <div>
                  <strong>{r.month}</strong> {r.year} – {r.wasteType}  
                  ({r.amount} {r.unit}) →{" "}
                  <span className="text-green-600 font-medium">
                    {r.co2Emission.toFixed(2)} kg CO₂
                  </span>
                </div>

                <button
                  onClick={() => deleteRecord(r._id)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
