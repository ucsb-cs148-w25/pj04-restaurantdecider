import express from "express";
import fetch from "node-fetch";
import { authMiddleware } from './authMiddleware.js'

const router = express.Router();

router.post("/restaurants", authMiddleware, async (req, res) => {
  // console.log("Received request body:", req.body);
  const { latitude, longitude, radius, listSize } = req.body;

  // Validate required fields
  if (!latitude || !longitude || !radius || !listSize) {
    console.error("Missing required fields:", {
      latitude,
      longitude,
      radius,
      listSize,
    });
    return res.status(400).json({
      error: "INVALID_REQUEST",
      message: "Missing required fields",
      details: { latitude, longitude, radius, listSize },
    });
  }

  const listSizes = { short: 8, medium: 16, long: 32 };
  const limit = listSizes[listSize] || 8;
  const radiusInMeters = radius * 1609.344;

  try {
    const url = "https://places.googleapis.com/v1/places:searchNearby";
    const requestBody = {
      includedTypes: ["restaurant", "coffee_shop", "cafe", "bakery"],
      maxResultCount: limit,
      locationRestriction: {
        circle: {
          center: {
            latitude: latitude,
            longitude: longitude,
          },
          radius: radiusInMeters,
        },
      },
      rankPreference: "DISTANCE",
    };

    // console.log("Sending request to Google Places API:", requestBody);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.MAPS_API_KEY,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.photos,places.rating,places.userRatingCount",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!data.places) {
      console.error("Google Places API error:", data.error || "Unknown error");
      return res.status(400).json({
        error: "REQUEST_DENIED",
        message: data.error?.message || "Failed to fetch restaurants",
        details: data.error || "No error details available",
      });
    }

    const restaurants = data.places.map((place) => ({
      name: place.displayName?.text || "No name available",
      reviews: place.userRatingCount || 0,
      rating: place.rating || 0,
      address: place.formattedAddress || "",
      menuImages: place.photos ? place.photos.map((photo) => photo.name) : [],
    }));

    res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Internal server error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

router.post("/restaurantphoto", authMiddleware, async (req, res) => {
  const { resource_id, max_width_px } = req.body;
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/${resource_id}/media?key=${process.env.MAPS_API_KEY}&max_width_px=${max_width_px}`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": process.env.MAPS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const imageBuffer = await response.buffer();
    res.set("Content-Type", "image/jpeg");
    res.send(imageBuffer);
  } catch (error) {
    console.error("Error fetching image:", error);
    res
      .status(500)
      .json({ error: "Internal server error", message: error.message });
  }
});

export default router;
