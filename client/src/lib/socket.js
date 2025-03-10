import { setContext, getContext } from 'svelte';
import { io } from 'socket.io-client';
import { socketEndpoint } from '$lib/index.js';
import { getAuthToken } from '$lib/stores/userStore.svelte.js';

const SOCKET_CONTEXT_KEY = 'socket';

// Singleton instance
let socketInstance = null;

/**
 * Creates or returns the singleton socket instance
 * @returns {Socket} The socket.io client instance
 */
function createSocket() {
	if (!socketInstance) {
		console.log('creating new socket');
		// Include auth token in the socket connection
		// Check if document exists before getting auth token (needed for SSR)
		const authToken = getAuthToken();
		console.log('Connecting socket with auth token:', authToken);

		socketInstance = io(socketEndpoint, {
			auth: { token: authToken },
			withCredentials: true
		});

		console.log('socket created ', socketInstance);

		// Handle disconnection and cleanup
		socketInstance.on('disconnect', () => {
			console.log('Socket disconnected');
		});
	}

	return socketInstance;
}

/**
 * Initialize socket and set it in the Svelte context
 * @returns {Socket} The socket.io client instance
 */
export function initSocket() {
	// Try to get from context first
	let socket = getContext(SOCKET_CONTEXT_KEY);

	if (!socket) {
		// Create or get the singleton instance
		socket = createSocket();
		// Store in context for component tree access
		setContext(SOCKET_CONTEXT_KEY, socket);
	}

	return socket;
}

/**
 * Get the socket instance directly without context
 * @returns {Socket} The socket.io client instance
 */
export function getSocket() {
	return createSocket();
}
