let username = $state({ text: '' });

export function getUsername() {
	return username.text;
}

export function setUsername(newUsername) {
	username.text = newUsername;
}

export function getAuthToken() {
	try {
		if (!document.cookie) return null;

		const cookieValue = document.cookie.split('; ').find((row) => row.startsWith('auth='));

		if (!cookieValue) {
			console.warn('Auth cookie not found');
		}

		const token = cookieValue.split('=')[1];
		if (!token) {
			console.warn('Auth token is empty');
			return null;
		}

		return token;
	} catch (error) {
		console.error('Error retrieving auth token:', error);
		return null;
	}
}
