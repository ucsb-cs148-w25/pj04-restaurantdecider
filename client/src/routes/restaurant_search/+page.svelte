<h1>Search for Restaurants</h1>

<p>Radius (miles)</p>
<Input placeholder="Radius" class="max-w-xs" type="number"></Input>


<DropdownMenu.Root>
	<DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}>Number of Restaurants to Display</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56">
		<DropdownMenu.Group>
			<DropdownMenu.RadioGroup bind:value={position}>
				<DropdownMenu.RadioItem value="short">8</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="medium">16</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value="long">32</DropdownMenu.RadioItem>
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>


<div class="location-picker">
	<div class="search-container">
		<Input
			id="search-box"
			type="text"
			placeholder="Search for a location"
			class="search-input"
		/>
	</div>
	
	<div bind:this={mapContainer} class="map-container"></div>
	
	<div class="coordinates">
		<p>Selected Location:</p>
		{#if latitude !== 0 && longitude !== 0}
				<p>Latitude: {latitude.toFixed(6)}</p>
				<p>Longitude: {longitude.toFixed(6)}</p>
		{:else}
				<p>No location selected</p>
		{/if}
	</div>
</div>

<form on:submit={handleSubmit}>
		<Button type="submit">Search</Button>
</form>

<script lang="ts">
		import { onMount } from 'svelte';
		import { Button } from '$lib/components/ui/button';
		import { buttonVariants } from '$lib/components/ui/button';
		import { Input } from '$lib/components/ui/input';
		import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
		import type { PageData } from './$types';

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
	
		let handleSubmit = (e) => {
				e.preventDefault();
				console.log('submit'); // TODO
		}
		
		let { data } = $props<{ data: PageData }>();
		let position = $state("bottom");
		let latitude = $state(0);
		let longitude = $state(0);
		let mapContainer;
		let map;
		let marker;
		let searchBox;
		let isLoading = true;
		let scriptLoaded = false;

		function updateCoordinates(lat, lng) {
				latitude = lat;
				longitude = lng;
		}

		async function initializeMap() {
				try {
						const { Map } = await google.maps.importLibrary("maps");
						const places = await google.maps.importLibrary("places");
						const { Marker } = await google.maps.importLibrary("marker");
					
						// initialize map and pin
						map = new Map(mapContainer, {
								zoom: data.mapConfig.defaultZoom,
								center: data.mapConfig.defaultCenter,
								mapTypeId: 'roadmap'
						});
						marker = new Marker({ map, draggable: true });
					
						// initialize the search box
						const input = document.getElementById('search-box');
						searchBox = new places.SearchBox(input);  // Use places directly here

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

						map.addListener('dragend', (e) => {
								marker.setPosition(e.latLng);
								updateCoordinates(e.latLng.lat(), e.latLng.lng());
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
	.map-container {
		width: 100%;
		height: 400px;  /* or whatever height you prefer */
		margin: 20px 0;
	}

	.hidden {
		display: none;
	}
	
	.search-container {
		display: flex;
		gap: 8px;
		margin-bottom: 8px;
	}
	
	.search-container button {
		padding: 8px 16px;
	}
</style>