// src/lib/stores/userStore.js
import { writable } from 'svelte/store';

// Create a writable store for username, initialized with localStorage value if it exists
export const username = writable(localStorage.getItem('username') || '');

// Create a writable store for user profile data, initialized with localStorage value if it exists
export const userProfileData = writable(
    JSON.parse(localStorage.getItem('userProfileData')) || { champions: [] }
);

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
    // Persist username to localStorage
    localStorage.setItem('username', newUsername);
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

        const updatedProfile = {
            ...current,
            champions: updatedChampions,
        };

        // Persist user profile data to localStorage
        localStorage.setItem('userProfileData', JSON.stringify(updatedProfile));

        return updatedProfile;
    });
}