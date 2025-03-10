<script lang="js">
	import { getSocket } from '$lib/socket.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getAuthToken, getUsername, setUsername } from '$lib/stores/userStore.svelte.js';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import LogoNoMove from '$lib/images/WEAT_unmoving.png';
	import { apiBaseUrl } from '$lib';
	import { setRestaurantsList } from '$lib/stores/bracketStore.svelte';

	// Get roomId from the URL
	const roomId = $page.params.room_id;

	// Socket and state variables
	let socket = getSocket();
	let connected = $state(false);
	let isOwner = $state(false);
	let lobbySettings = $state(null);
	let users = $state([]);
	let errorMessage = $state('');
	let username = $state('');

	onMount(async () => {
		const checkLoginStatus = async () => {
			try {
				const response = await fetch(`${apiBaseUrl}/users/auto-login`, {
					method: 'GET',
					credentials: 'include',
					headers: {
						Authorization: `Bearer ${getAuthToken()}`
					}
				});
				if (response.ok) {
					const data = await response.json();
					console.log(data);
					setUsername(data.username);
				}
			} catch (error) {
				console.error('Auto-login check failed:', error);
			}
		};
		await checkLoginStatus();

		// Get username from store or set to Guest
		username = getUsername();
		console.log('username', username);

		// Handle connection state
		// socket.on('connect', () => {
		// 	connected = true;
		// 	console.log('Connected to Socket.IO server with ID:', socket.id);

		// 	// Join the lobby
		// 	console.log('Joining room:', roomId);
		// 	console.log('Username:', username);

		// 	socket.emit('joinRoom', { roomId, username });
		// });

		connected = true;
		console.log('Connected to Socket.IO server with ID:', socket.id);
		
		console.log('Joining room:', roomId);
		console.log('Username:', username);

		socket.emit('joinRoom', { roomId, username });
		

		// Handle user list updates
		socket.on('userList', (data) => {
			console.log('User list updated:', data);
			users = data.users;
		});

		// Handle disconnection
		socket.on('disconnect', () => {
			connected = false;
			console.log('Disconnected from Socket.IO server');
		});

		// Handle when successfully joined the lobby
		socket.on('joinedLobby', (data) => {
			console.log('Joined lobby:', data);
			isOwner = data.isOwner;
			lobbySettings = data.lobbySettings;
		});

		// Handle lobby errors
		socket.on('lobbyError', (error) => {
			console.error('Lobby error:', error);
			errorMessage = error.error || 'An error occurred';
			// Redirect back to test page if the room doesn't exist
			if (error.error === 'Lobby not found') {
				setTimeout(() => goto('/test'), 2000);
			}
		});

		// Handle game start
		socket.on('bracketStarted', (data) => {
			console.log('Game started:', data);
			// Navigate to the bracket page and pass data
			setRestaurantsList(data.lobbySettings.restaurant_list);
			goto(`/test/${roomId}/bracket`);
		});
	});

	// Function to start the game (only available to the owner)
	function startGame() {
		console.log('pressed');
		console.log('start game', isOwner);
		if (isOwner) {
			socket.emit('startLobby', roomId);
		}
	}

	// Function to leave the room
	function leaveRoom() {
		// Navigate back to the test page
		socket.emit('leaveRoom', { roomId });
		goto('/');
	}
</script>

<div class="flex min-h-screen flex-col">
	<header class="header-bg flex justify-between p-4">
		<a href="/"><img src={LogoNoMove} alt="Logo" style="width: 8rem" /></a>
		<div class="space-x-2">
			<Button variant="outline" onclick={leaveRoom} class="leave-btn">Leave Room</Button>
		</div>
	</header>

	<main class="flex flex-grow flex-col items-center justify-center p-6">
		{#if errorMessage}
			<div class="mb-4 w-full max-w-md rounded-md bg-red-100 p-4 text-red-800">
				{errorMessage}
			</div>
		{/if}

		<Card.Root class="w-full max-w-3xl">
			<Card.Header>
				<Card.Title class="text-2xl">Waiting Room</Card.Title>
				<Card.Description>Room ID: {roomId}</Card.Description>
				<Card.Description>Username: {username}</Card.Description>
			</Card.Header>

			<Card.Content>
				<div class="mb-6">
					<h3 class="mb-2 text-lg font-semibold">Participants</h3>
					<div class="rounded-md bg-white p-4 shadow-sm">
						{#if users.length === 0}
							<p class="text-gray-500">No participants yet</p>
						{:else}
							<ul class="space-y-2">
								{#each users as user}
									<li class="flex items-center justify-between">
										<span>{user.username || 'Guest'}{user.isOwner ? ' (Host)' : ''}</span>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>

				{#if isOwner}
					<div class="text-center">
						<Button onclick={startGame} class="px-8 py-2 text-lg">Start Game</Button>
						<p class="mt-2 text-sm text-gray-500">
							{#if users.length < 1}
								You need at least one participant to start the game
							{:else}
								Click to start when everyone has joined
							{/if}
						</p>
					</div>
				{:else}
					<div class="text-center">
						<p class="text-lg">Waiting for the host to start the game...</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		min-height: 100vh;
	}
</style>
