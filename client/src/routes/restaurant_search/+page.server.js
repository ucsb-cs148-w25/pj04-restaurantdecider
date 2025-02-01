import { MAPS_API_KEY } from '$env/static/private';

// allows us to access the MAPS_API_KEY from the environment
export const load = async () => {
    return {
        mapConfig: {
            apiKey: MAPS_API_KEY,
            defaultZoom: 13,
            defaultCenter: { lat: 34.4140, lng: -119.8489 }
        }
    };
};