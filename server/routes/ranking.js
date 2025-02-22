import express from "express";
const router = express.Router();

let rankedRestaurants = [];

router.post("/rankings", (req, res) => {
    try {
        const { restaurants } = req.body;
        if (!Array.isArray(restaurants)) {
            return res.status(400).json({ error: 'Restaurants must be an array' });
        }
        
        rankedRestaurants = restaurants.map(restaurant => ({
            id: restaurant.id,
            name: restaurant.name,
            image: restaurant.image,
            description: restaurant.description,
            score: restaurant.score
        }));
        
        res.status(200).json({ message: 'Rankings stored successfully' });
    } catch (error) {
        console.error('Error storing rankings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/", (req, res) => {
    try {
        res.status(200).json({ restaurants: rankedRestaurants });
    } catch (error) {
        console.error('Error retrieving rankings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;