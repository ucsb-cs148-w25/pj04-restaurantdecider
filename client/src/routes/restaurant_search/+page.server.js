import { MAPS_API_KEY } from '$env/static/private';
import { browser } from '$app/environment'; 

export const load = async () => {
  // Default location set to San Jose for testing
  // if this works correctly, it should point to UCSB
  let user_loc = { lat: 37.3128, lng: -121.9610 };

  // Function to get geolocation using a Promise
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          (error) => {
            console.error("Geolocation error:", error.message);
            resolve(user_loc); // Use default if error occurs
          }
        );
      } else {
        console.error("Geolocation is NOT supported in this browser.");
        resolve(user_loc); // Use default if not supported
      }
    });
  };

  user_loc = await getUserLocation();

  return {
    mapConfig: {
      apiKey: MAPS_API_KEY,
      defaultZoom: 13,
      defaultCenter: user_loc
    }
  };
};