<header class="fixed left-0 right-0 top-0 z-50 flex justify-between bg-white p-4">
	<a href="/" class="text-lg font-bold text-black hover:underline">Weat</a>
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

<div class="pt-16 pb-24 min-h-screen flex justify-center items-start space-x-8">
  <!-- Card Section -->
  <Card.Root class="card-root w-2/5 mt-8">
    <Card.Header class="text-center">
      <Card.Title tag="h1" class="text-5xl">Search for Restaurants</Card.Title>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center space-x-8 mt-4 self-start pl-4">
        <!-- Radius Input -->
        <div class="flex items-center">
          <p class="mr-2 text-xl">Radius (miles)</p>
          <Input 
            placeholder="Radius" 
            class="max-w-xs" 
            type="number" 
            bind:value={radius}
          />
        </div>
        
		<div class="flex flex-col items-start">
          <p class="mb-2 text-xl">Number of restaurants</p>
			<div class="flex space-x-4 mb-9">
				<div on:click={() => {numToShow = 8; }}>
				<Button 
					class={numToShow === 8 ? "bg-blue-800 text-white w-16 hover:text-white hover:bg-blue-800" : "bg-gray-200 text-black hover:bg-blue-300 w-16"} 
				>
					8
				</Button>
				</div>
				
				<div on:click={() => {numToShow = 16; }}>
				<Button 
				class={numToShow === 16 ? "bg-blue-800 text-white w-16 hover:text-white hover:bg-blue-800" : "bg-gray-200 text-black hover:bg-blue-300 w-16"} 
				>
					16
				</Button>
				</div>

				<div on:click={() => {numToShow = 32; }}>
				<Button 
					class={numToShow === 32 ? "bg-blue-800 text-white w-16 hover:text-white hover:bg-blue-800" : "bg-gray-200 text-black hover:bg-blue-300 w-16"} 
				>
					32
				</Button>
				</div>
			</div>
		</div>
      </div>

      <div class="search-container self-start mt-2 pl-4 w-full max-w-4xl">
        <Input id="search-box" type="text" placeholder="Search for a location" class="search-input w-full" />
      </div>

	  <div class="flex flex-col items-start pl-4 mt-8">
		<div class="flex space-x-4 mb-8">
			<div on:click={() => {rankingStyle = 1; }}>
				<Button 
					class={rankingStyle === 1 ? "bg-blue-800 text-white w-32 hover:text-white hover:bg-blue-800" : "bg-gray-200 text-black hover:bg-blue-300 w-32"}
				>
					Champion Style
				</Button>
			</div>

			<div on:click={() => {rankingStyle = 2; }}>
			<Button 
				class={rankingStyle === 2 ? "bg-blue-800 text-white w-32 hover:text-white hover:bg-blue-800" : "bg-gray-200 text-black hover:bg-blue-300 w-32"} 
			>
				Bracket Style
			</Button>
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
		<Button type="submit" class="text-white bg-black hover:bg-gray-500 mb-2 flex items-center justify-center space-x-2">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
				<path d="M11.742 10.344a6.5 6.5 0 1 0-1.398 1.398l4.25 4.25a1 1 0 1 0 1.414-1.414l-4.25-4.25zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
			</svg>
			<span>Search</span>
		</Button>
		{#if errorMessage}
			<p class="text-red-500 font-medium text-center">{errorMessage}</p>
		{/if}
	  </form>

    </Card.Content>
  </Card.Root>

  <!-- Map Section -->
  <div class="location-picker w-2/5 mt-8">
    <div bind:this={mapContainer} class="map-container"></div>
  </div>
</div>

<script lang="js">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Card from '$lib/components/ui/card';
	import { apiBaseUrl } from '$lib/index.js';
	import { setRestaurantsList } from '$lib/stores/bracketStore.svelte.js';
	import { getAuthToken } from '$lib/stores/userStore.svelte.js';

	let { data } = $props();
	let numToShow = $state(0);
	let rankingStyle = $state(0); //champion (1) or bracket style (2)
	let latitude = $state(0);
	let longitude = $state(0);
	let radius = $state(0);
	let user_preferences = $state(["restaurant", "coffee_shop", "cafe", "bakery"]);
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
<<<<<<< HEAD
		selectedOptions = selectedOptions.filter(item => item !== option);
		} else {
		selectedOptions.push(option);
=======
			selectedOptions = selectedOptions.filter(item => item !== option);
			user_preferences = user_preferences.filter(item => item !== option.toLowerCase());
		} else {
			selectedOptions.push(option);
			if(option === "Coffee shop"){
				user_preferences.push("coffee_shop");
			} else{
				user_preferences.push(option.toLowerCase());
			}
>>>>>>> 3c180d13332d0e4c322353295cc2f28023579541
		}
	}
	// Load Google Maps script dynamically
	onMount(async () => {
		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${data.mapConfig.apiKey}&libraries=places`;
		script.async = true;
		script.defer = true;
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
			user_preferences: user_preferences,
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
			.then((response) => response.json())
			.then((data) => {
				setRestaurantsList(data);
				if (rankingStyle === 1) {
					goto('/champion');
				} else if (rankingStyle === 2) {
					goto('/bracket');
				}
			})
			.catch((error) => {
				console.error('Error fetching restaurants:', error);
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
