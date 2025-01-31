import express from "express";
import fetch from "node-fetch";

const router = express.Router();
const MAPS_API_KEY = process.env.MAPS_API_KEY;

router.post("/restaurants", async (req, res) => {
  const { latitude, longitude, radius, listSize } = req.body;
  const milesToMeters = radius * 1609.344;
  const listSizes = { short: 8, medium: 16, long: 32 };
  const limit = listSizes[listSize] || 8;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${milesToMeters}&type=restaurant&key=${MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(400).json({ error: data.status, message: data.error_message });
    }

    const restaurants = data.results.slice(0, limit).map((place) => ({
      name: place.name,
      reviews: place.user_ratings_total || "No reviews available",
      menuImages: place.photos
        ? place.photos.map(
            (photo) =>
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${MAPS_API_KEY}`
          )
        : [],
    }));

    res.status(200).json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

export default router;
