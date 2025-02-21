import request from 'supertest';
import express from 'express';
import rankingRouter from '../routes/ranking.js';

const app = express();
app.use(express.json());
app.use('/', rankingRouter);

describe('Ranking Router Tests', () => {
    const sampleRestaurants = [
        {
            id: 1,
            name: "Test Restaurant 1",
            image: "test1.jpg",
            description: "Test Description 1",
            score: 5
        },
        {
            id: 2,
            name: "Test Restaurant 2",
            image: "test2.jpg",
            description: "Test Description 2",
            score: 3
        }
    ];

    test('POST /rankings should store restaurant rankings', async () => {
        const response = await request(app)
            .post('/rankings')
            .send({ restaurants: sampleRestaurants });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Rankings stored successfully');
    });

    test('GET / should retrieve stored rankings', async () => {
        // First store some rankings
        await request(app)
            .post('/rankings')
            .send({ restaurants: sampleRestaurants });

        // Then retrieve them
        const response = await request(app)
            .get('/');
        
        expect(response.status).toBe(200);
        expect(response.body.restaurants).toHaveLength(2);
        expect(response.body.restaurants[0].name).toBe('Test Restaurant 1');
        expect(response.body.restaurants[1].name).toBe('Test Restaurant 2');
    });

    test('POST /rankings should return 400 for invalid input', async () => {
        const response = await request(app)
            .post('/rankings')
            .send({ restaurants: "not an array" });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Restaurants must be an array');
    });
});
