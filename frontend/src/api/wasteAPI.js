// src/api/wasteAPI.js
import axios from "axios";

export const saveWasteRecord = async (formData, token) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Required for protect middleware
      },
    };

    const { data } = await axios.post(
      "http://localhost:5000/api/waste/calculate",
      formData,
      config
    );

    alert("Record saved successfully!");
    return data;
  } catch (error) {
    console.error("Error saving record:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Failed to save record.");
  }
};
