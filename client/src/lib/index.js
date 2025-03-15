export let apiBaseUrl =
	process.env.NODE_ENV == 'production'
		? 'https://cs148.tanaybiradar.com/api'
		: 'http://localhost:3000/api';

export let socketEndpoint =
	process.env.NODE_ENV == 'production'
		? 'https://cs148.tanaybiradar.com/socket'
		: 'http://localhost:3001';
