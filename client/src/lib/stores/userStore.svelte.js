let username = $state({ text: '' });

export function getUsername() {
	return username.text;
}

export function setUsername(newUsername) {
	username.text = newUsername;
}
