const Emission = require("../models/Emission");

exports.saveWidgetEmission = async (req, res) => {
  try {
    const record = await Emission.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: "Save failed" });
  }
};

exports.getWidgetEmissions = async (req, res) => {
  try {
    const data = await Emission.find({
      userId: req.params.userId,
      source: "electron_widget",
    }).sort({ timestamp: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
};
