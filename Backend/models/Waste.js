import mongoose from "mongoose";

const wasteSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    facility: { 
      type: String, 
      required: true,
      enum: ["Home", "Office", "Lab"]
    },

    year: { 
      type: String,   // ← frontend sends string ("2023", "2024")
      required: true 
    },

    month: { 
      type: String, 
      required: true,
      enum: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
    },

    wasteType: { 
      type: String, 
      required: true,
      enum: ["Laptop", "Desktop", "Monitor", "Battery", "Cable", "Motherboard"]
    },

    treatmentType: { 
      type: String, 
      required: true,
      enum: ["Recycled", "Disposed", "Donated", "Reused"]
    },

    unit: { 
      type: String, 
      required: true,
      enum: ["Pieces", "Kg", "Tons"]
    },

    amount: { 
      type: Number, 
      required: true,
      min: 1 
    },

    co2Emission: { 
      type: Number, 
      required: true 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Waste", wasteSchema);
