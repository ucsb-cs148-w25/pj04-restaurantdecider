<script lang="js">
	import { getSocket } from '$lib/socket.js';
	import { getUsername } from '$lib/stores/userStore.svelte.js';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Card from '$lib/components/ui/card';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { apiBaseUrl } from '$lib/index.js';
	import { setRestaurantsList } from '$lib/stores/bracketStore.svelte.js';
	import { getAuthToken } from '$lib/stores/userStore.svelte.js';
	import LogoNoMove from '$lib/images/WEAT_unmoving.png';

	// Get the singleton socket instance
	let socket = getSocket();
	let connected = $state(false);
	let userId = $state('');
	let username = $state('');

	socket.on('connect', () => {
		connected = true;
		userId = socket.id;
		console.log('Connected to Socket.IO server with ID:', userId);
		// Set username in socket
		username = getUsername();
		socket.username = username || 'Guest';

		// Ensure the auth token is available in the socket connection
		const authToken = getAuthToken();
		if (authToken) {
			console.log('Auth token is available for socket authentication');
		} else {
			console.log('No auth token available for socket authentication');
		}
	});

	// Handle lobby creation response
	socket.on('lobbyCreated', ({ roomId, isOwner, lobbySettings }) => {
		console.log('Lobby created:', { roomId, isOwner, lobbySettings });
		// Navigate to the room page
		goto(`/group/${roomId}`);
	});

	// Handle lobby creation errors
	socket.on('lobbyError', ({ error }) => {
		console.error('Lobby error:', error);
		errorMessage = error;

		// If authentication error, redirect to login
		if (error.includes('Authentication required')) {
			// Wait a moment to show the error before redirecting
			setTimeout(() => {
				goto('/login?redirect=' + encodeURIComponent(window.location.pathname));
			}, 2000);
		}
	});

	let { data } = $props();
	let numToShow = $state(0);
	let rankingStyle = $state(0); //champion (1) or bracket style (2)
	let latitude = $state(0);
	let longitude = $state(0);
	let radius = $state(0);
	let user_preferences = $state(['restaurant', 'coffee_shop', 'cafe', 'bakery']);
	let mapContainer;
	let map;
	let marker;
	let searchBox;
	let isLoading = true;
	let scriptLoaded = false;
	let errorMessage = $state('');

	let selectedOptions = ['Restaurant', 'Cafe', 'Coffee shop', 'Bakery'];
	const options = ['Restaurant', 'Cafe', 'Coffee shop', 'Bakery'];

	function toggleOption(option) {
		if (selectedOptions.includes(option)) {
			selectedOptions = selectedOptions.filter((item) => item !== option);
			user_preferences = user_preferences.filter((item) => item !== option.toLowerCase());
		} else {
			selectedOptions.push(option);
			if (option === 'Coffee shop') {
				user_preferences.push('coffee_shop');
			} else {
				user_preferences.push(option.toLowerCase());
			}
		}
	}
	// Load Google Maps script dynamically
	onMount(async () => {
		// Get username from store
		username = getUsername();

		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${data.mapConfig.apiKey}&libraries=places&v=weekly`;
		script.async = true;
		script.defer = true;
		script.crossOrigin = 'anonymous';
		// Add a specific error handler
		script.onerror = (error) => {
			console.error('Error loading Google Maps API:', error);
		};
		script.onload = () => {
			scriptLoaded = true;
			initializeMap();
		};
		document.head.appendChild(script);
	});

	async function handleSignOut() {
		await fetch(`${apiBaseUrl}/users/signout`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getAuthToken()}`
			},
			credentials: 'include'
		});
		goto('/');
	}

	let handleSubmit = (e) => {
		e.preventDefault();

		// Clear any previous error
		errorMessage = '';

		// Validate coordinates
		if (latitude === 0 && longitude === 0) {
			errorMessage = 'Please select a location on the map';
			return;
		}

		// Validate radius
		if (!radius || radius <= 0 || radius > 30) {
			errorMessage = 'Please enter a valid radius (greater than 0 and less than 30)';
			return;
		}

		// Validate number of restaurants
		if (!numToShow || numToShow <= 0) {
			errorMessage = 'Please select a valid number of restaurants to show';
			return;
		}

		//Validate ranking style
		if (!rankingStyle || rankingStyle <= 0) {
			errorMessage = 'Please select a valid ranking style';
			return;
		}

		//Validate user preferences
		if (!user_preferences || user_preferences.length === 0) {
			errorMessage = 'Please select at least one user preference';
			return;
		}

		let dataToSend = {
			latitude: latitude,
			longitude: longitude,
			radius: radius,
			listSize: numToShow,
			user_preferences: user_preferences
		};

		fetch(`${apiBaseUrl}/maps/restaurants`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getAuthToken()}`
			},
			credentials: 'include',
			body: JSON.stringify(dataToSend)
		})
			.then(async (response) => {
				if (!response.ok) {
					// If status is not OK, try to read the response as text to see what we got
					const errorText = await response.text();
					console.error('Server response not OK:', response.status, errorText);
					throw new Error(`Server returned ${response.status}: ${errorText.substring(0, 100)}...`);
				}

				// Check Content-Type header to ensure we're getting JSON
				const contentType = response.headers.get('content-type');
				if (!contentType || !contentType.includes('application/json')) {
					const text = await response.text();
					console.error('Response was not JSON:', contentType, text.substring(0, 100));
					throw new Error('Server did not return JSON');
				}

				return response.json();
			})
			.then((data) => {
				let lobbySettings = {
					restaurant_list: data,
					rankingStyle: rankingStyle === 1 ? 'champion' : 'bracket'
				};
				// Create lobby with authentication
				const authToken = getAuthToken();
				if (authToken) {
					console.log('Creating authenticated lobby');
					socket.emit('createLobby', lobbySettings);
				} else {
					console.log('Authentication required to create a lobby');
					errorMessage = 'Authentication required to create a lobby. Please log in.';
					// Redirect to login page
					setTimeout(() => {
						goto('/login?redirect=' + encodeURIComponent(window.location.pathname));
					}, 2000);
				}
			})
			.catch((error) => {
				console.error('Error fetching restaurants:', error);
				errorMessage = `Error fetching restaurants: ${error.message}`;
			});
	};

	function updateCoordinates(lat, lng) {
		latitude = lat;
		longitude = lng;
	}

	async function initializeMap() {
		try {
			const { Map } = await google.maps.importLibrary('maps');
			const places = await google.maps.importLibrary('places');
			const { Marker } = await google.maps.importLibrary('marker');

			// initialize map and pin
			map = new Map(mapContainer, {
				zoom: data.mapConfig.defaultZoom,
				center: data.mapConfig.defaultCenter,
				mapTypeId: 'roadmap'
			});
			marker = new Marker({ map, draggable: true });

			// initialize the search box
			const input = document.getElementById('search-box');
			searchBox = new places.SearchBox(input); // Use places directly here

			// set up event listeners
			map.addListener('bounds_changed', () => {
				searchBox.setBounds(map.getBounds());
			});

			searchBox.addListener('places_changed', () => {
				// where are we?
				const places = searchBox.getPlaces();
				if (places.length === 0) return;
				const place = places[0];

				if (place.geometry.viewport) {
					map.fitBounds(place.geometry.viewport);
				} else {
					map.setCenter(place.geometry.location);
					map.setZoom(17);
				}

				marker.setPosition(place.geometry.location);
				updateCoordinates(place.geometry.location.lat(), place.geometry.location.lng());
			});

			marker.addListener('dragend', (e) => {
				const position = marker.getPosition();
				updateCoordinates(position.lat(), position.lng());
			});

			map.addListener('click', (e) => {
				marker.setPosition(e.latLng);
				updateCoordinates(e.latLng.lat(), e.latLng.lng());
			});

			isLoading = false;
		} catch (error) {
			console.error('Error initializing map:', error);
			isLoading = false;
		}
	}
</script>

<header class="header-bg absolute left-0 right-0 top-0 z-50 flex justify-between p-4">
	<a href="/homepage"><img src={LogoNoMove} alt="Logo" style="width: 8rem" /></a>
	<div class="space-x-2">
		<form on:submit|preventDefault={handleSignOut}>
			<Button href="/profile" variant="outline" size="sm" class="bg-black text-white"
				>Profile</Button
			>
			<Button type="submit" variant="outline" size="sm" class="bg-black text-white">Sign Out</Button
			>
		</form>
	</div>
</header>

<div class="flex min-h-screen items-start justify-center space-x-8 pb-24 pt-16">
	<!-- Card Section -->
	<Card.Root class="card-root mt-8 w-2/5">
		<Card.Header class="text-center">
			<Card.Title tag="h1" class="text-5xl">Set Location for Group</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="mt-4 flex items-center space-x-8 self-start">
				<!-- Radius Input -->
				<div class="flex items-center">
					<p class="mr-2 text-xl">Radius (miles)</p>
					<Input placeholder="Radius" class="max-w-xs" type="number" bind:value={radius} />
				</div>

				<div class="flex flex-col items-start">
					<p class="mb-2 text-xl">Number of restaurants</p>
					<div class="mb-9 flex space-x-4">
						<div
							on:click={() => {
								numToShow = 8;
							}}
						>
							<Button
								class={numToShow === 8
									? 'w-16 bg-blue-700 text-white hover:bg-blue-700 hover:text-white'
									: 'w-16 bg-gray-200 text-black hover:bg-blue-300'}
							>
								8
							</Button>
						</div>

						<div
							on:click={() => {
								numToShow = 16;
							}}
						>
							<Button
								class={numToShow === 16
									? 'w-16 bg-blue-700 text-white hover:bg-blue-700 hover:text-white'
									: 'w-16 bg-gray-200 text-black hover:bg-blue-300'}
							>
								16
							</Button>
						</div>

						<div
							on:click={() => {
								numToShow = 32;
							}}
						>
							<Button
								class={numToShow === 32
									? 'w-16 bg-blue-700 text-white hover:bg-blue-700 hover:text-white'
									: 'w-16 bg-gray-200 text-black hover:bg-blue-300'}
							>
								32
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div class="search-container mt-2 w-full max-w-4xl self-start">
				<Input
					id="search-box"
					type="text"
					placeholder="Search for a location"
					class="search-input w-full"
				/>
			</div>

			<div class="mt-8 flex flex-col items-start">
				<div class="mb-8 flex space-x-4">
					<div
						on:click={() => {
							rankingStyle = 1;
						}}
					>
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger
									class={rankingStyle === 1
										? 'h-10 w-32 rounded-md bg-blue-700 text-white hover:bg-blue-700 hover:text-white'
										: 'h-10 w-32 rounded-md bg-gray-200 text-black hover:bg-blue-300'}
									>Champion Style</Tooltip.Trigger
								>
								<Tooltip.Content>
									<p>Only get number one ranked restaurant</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>

					<div
						on:click={() => {
							rankingStyle = 2;
						}}
					>
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger
									class={rankingStyle === 2
										? 'h-10 w-32 rounded-md bg-blue-700 text-white hover:bg-blue-700 hover:text-white'
										: 'h-10 w-32 rounded-md bg-gray-200 text-black hover:bg-blue-300'}
									>Bracket Style</Tooltip.Trigger
								>
								<Tooltip.Content>
									<p>Get a ranked scoreboard with all restaurants</p>
								</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>
				</div>
			</div>

			<div class="flex flex-col items-start">
				<p class="mb-2 text-xl">Select Types of Places</p>

				{#each options as option}
					<label class="flex items-center">
						<input
							type="checkbox"
							checked={selectedOptions.includes(option)}
							on:change={() => toggleOption(option)}
						/>
						<span class="ml-2">{option}</span>
					</label>
				{/each}
			</div>

			<form on:submit={handleSubmit} class="flex flex-col items-center">
				<Button
					type="submit"
					class="mb-2 flex items-center justify-center space-x-2 bg-black text-white hover:bg-gray-500"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						fill="currentColor"
						class="bi bi-search"
						viewBox="0 0 16 16"
					>
						<path
							d="M11.742 10.344a6.5 6.5 0 1 0-1.398 1.398l4.25 4.25a1 1 0 1 0 1.414-1.414l-4.25-4.25zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
						/>
					</svg>
					<span>Search</span>
				</Button>
				{#if errorMessage}
					<p class="text-center font-medium text-red-500">{errorMessage}</p>
				{/if}
			</form>
		</Card.Content>
	</Card.Root>

	<!-- Map Section -->
	<div class="location-picker mt-8 w-2/5">
		<div bind:this={mapContainer} class="map-container"></div>
	</div>
</div>

<style>
	body {
		margin: 0;
		padding: 0;
		min-height: 80vh;
	}

	/* Map Container */
	.map-container {
		width: 100%;
		height: 100%;
		border-radius: 12px;
		flex-grow: 1;
		min-height: 80vh;
	}

	/* Hidden Elements */
	.hidden {
		display: none;
	}

	/* Search Container */
	.search-container {
		display: flex;
		gap: 8px;
		margin-bottom: 8px;
	}

	.search-container button {
		padding: 16px 16px;
	}

	/* Coordinates */
	.coordinates {
		width: 66.66%;
		margin: 0 auto;
		padding-left: 5px;
		margin-top: 16px;
	}

	/* Location Picker */
	.location-picker {
		position: relative;
		width: 40vw;
		height: 80vh;
		margin-top: 2rem;
		max-width: 40vw;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}

	/* Flexbox Container */
	.pt-16.pb-24 {
		display: flex;
		justify-content: center;
		align-items: stretch;
		gap: 32px;
	}

	.pt-16.pb-24 > .card-root,
	.pt-16.pb-24 > .location-picker {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.card-root {
		display: flex;
		flex-direction: column;
		height: 80vh;
	}

	.card-root .card-content {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
	}
</style>
