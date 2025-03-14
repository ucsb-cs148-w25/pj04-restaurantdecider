import { MAPS_API_KEY } from '$env/static/private';
import { browser } from '$app/environment'; 

// Helper: Uses geolocation to get the user's current location
async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      reject(new Error('Geolocation is not supported by this browser.'));
    }
  });
}

// SvelteKit `load` function
export const load = async () => {
  // Default to Isla Vista if geolocation fails or isn’t available
  let user_loc = { lat: 34.4128, lng: -119.8610 };

  // Only attempt geolocation in the browser
  if (browser) {
    try {
      user_loc = await getCurrentLocation();
    } catch (error) {
      console.error('Geolocation failed—defaulting to Isla Vista.\nError:', error);
    }
  }

  return {
    mapConfig: {
      apiKey: MAPS_API_KEY,
      defaultZoom: 13,
      // Center on the user's location if available, otherwise default
      defaultCenter: user_loc
    }
  };
};
