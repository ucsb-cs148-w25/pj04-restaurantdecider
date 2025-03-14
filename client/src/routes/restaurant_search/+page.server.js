import { MAPS_API_KEY } from '$env/static/private';

export const load = async () => {
  // Default location set to UCSB by default
  let user_loc = { lat: 34.4151682, lng: -119.8496976 };

  // Function to get geolocation using a Promise
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if ("geolocation" in navigator) {
        console.log("Geolocation works - getting location")
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