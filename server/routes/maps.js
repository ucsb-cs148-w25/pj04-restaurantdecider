import express from "express";
import fetch from "node-fetch";

const router = express.Router();

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

    const data = await response.json();

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


router.post('/restaurantphoto', async (req, res) => {
  const { resource_id, max_width_px } = req.body;
  try {
    const response = await fetch(`https://places.googleapis.com/v1/${resource_id}/media?key=${process.env.MAPS_API_KEY}&max_width_px=${max_width_px}`, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': process.env.MAPS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await response.buffer();
    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  }
})

export default router;
