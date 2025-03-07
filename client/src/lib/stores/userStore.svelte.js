// src/lib/stores/userStore.js
import { writable } from 'svelte/store';

// Create a writable store for username
export const username = writable('');

// Create a writable store for user profile data (including past rankings and champion)
export const userProfileData = writable({
    champions: [],
});

// Function to get the username
export function getUsername() {
    let value;
    username.subscribe(($username) => {
        value = $username;
    })();
    return value;
}

// Function to set the username
export function setUsername(newUsername) {
    username.set(newUsername);
}

// Function to get the auth token from cookies
export function getAuthToken() {
    return document.cookie?.split('; ')?.find(row => row?.startsWith('auth='))?.split('=')[1];
}

// Function to update user profile data (winners and champion)
export function setUserProfileData(data) {
    userProfileData.update((current) => {
        // Append the new champion to the champions array
        const updatedChampions = data.champions ? [...current.champions, ...data.champions] : current.champions;
        
        return {
            ...current,
            champions: updatedChampions
        };
    });
}
