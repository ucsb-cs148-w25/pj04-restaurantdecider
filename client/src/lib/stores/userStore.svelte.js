let username = $state({ text: '' });

export function getUsername() {
	return username.text;
}

export function setUsername(newUsername) {
	username.text = newUsername;
}

export function getAuthToken() {
	return document.cookie?.split('; ')?.find(row => row?.startsWith('auth='))?.split('=')[1]
}
