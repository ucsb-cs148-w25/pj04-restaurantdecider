import express from "express";
import fetch from "node-fetch";

const router = express.Router();
console.log('Loading Maps API Key in maps.js:', process.env.MAPS_API_KEY);

router.post("/restaurants", async (req, res) => {
  const { latitude, longitude, radius, listSize } = req.body;
  const listSizes = { short: 8, medium: 16, long: 32 };
  const limit = listSizes[listSize] || 8;
  const radiusInMeters = radius * 1609.344; 

  try {
    const url = 'https://places.googleapis.com/v1/places:searchNearby';
    const requestBody = {
      includedTypes: ["restaurant"],
      maxResultCount: limit,
      locationRestriction: {
        circle: {
          center: {
            latitude: latitude,
            longitude: longitude
          },
          radius: radiusInMeters
        }
      },
      rankPreference: "DISTANCE"
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.photos,places.rating,places.userRatingCount'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('API Request URL:', url);
    console.log('API KEY: ', process.env.MAPS_API_KEY)
    console.log('Request Headers:', {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.MAPS_API_KEY, 
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.photos,places.rating,places.userRatingCount'
    });
    
    const data = await response.json();
    console.log('API Response:', data);

    if (!data.places) {
      return res.status(400).json({ error: "REQUEST_DENIED", message: data.error?.message || "Failed to fetch restaurants" });
    }

    const restaurants = data.places.map((place) => ({
      name: place.displayName?.text || "No name available",
      reviews: place.userRatingCount || 0,
      rating: place.rating || 0,
      address: place.formattedAddress || "",
      menuImages: place.photos ? place.photos.map(photo => photo.name) : []
    }));

    res.status(200).json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
});

export default router;
