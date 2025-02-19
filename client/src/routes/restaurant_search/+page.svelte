<header class="fixed top-0 left-0 right-0 flex justify-between p-4 bg-white z-50">
  <a href="/" class="text-lg font-bold text-black hover:underline">Weat</a>
  <div class="space-x-2">
    <form on:submit|preventDefault={handleSignOut}>
      <Button href="/profile" variant="outline" size="sm" class="bg-black text-white">Profile</Button>
      <Button type="submit" variant="outline" size="sm" class="bg-black text-white">Sign Out</Button>
    </form>
  </div>
</header>

<div class="pt-16 pb-24 min-h-screen">
	<Card.Root class="w-2/3 mx-auto mt-8">
	<Card.Header class="text-center"> 
		<Card.Title tag="h1">Search for Restaurants</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="mt-4 self-start pl-4">
		<p>Radius (miles)</p>
		<Input placeholder="Radius" class="max-w-xs" type="number" bind:value={radius}></Input>
		</div>
		
		<div class="mt-4 self-start pl-4">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class={buttonVariants({ variant: "outline" })}>Show {numToShow} Restaurants</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56">
			<DropdownMenu.Group>
				<DropdownMenu.RadioGroup bind:value={numToShow}>
				<DropdownMenu.RadioItem value={8}>8</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value={16}>16</DropdownMenu.RadioItem>
				<DropdownMenu.RadioItem value={32}>32</DropdownMenu.RadioItem>
				</DropdownMenu.RadioGroup>
			</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		</div>

		<div class="search-container self-start mt-4 pl-4 w-full max-w-4xl">
		<Input
			id="search-box"
			type="text"
			placeholder="Search for a location"
			class="search-input w-full"
		/>
		</div>
	</Card.Content>
	</Card.Root>

	<div class="location-picker">
		<div bind:this={mapContainer} class="map-container"></div>
	</div>

	<div class="flex flex-col items-center fixed w-full space-y-4">
		<form on:submit={handleSubmit}>
		<Button 
			type="submit"
			class="text-white bg-black hover:bg-gray-600"
		>
			Search
		</Button>
		</form>
	</div>
  </div>

  <script lang="js">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/components/ui/button';
    import { buttonVariants } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
    import * as Card from "$lib/components/ui/card";
    import { apiBaseUrl } from '$lib/index.js';
    import { setRestaurantsList } from '$lib/stores/bracketStore.svelte.js';
    import { getAuthToken } from '$lib/stores/userStore.svelte.js';

    let { data } = $props();
    let numToShow = $state(8);
    let latitude = $state(0);
    let longitude = $state(0);
    let radius = $state(0);
    let mapContainer;
    let map;
    let marker;
    let searchBox;
    let isLoading = true;
    let scriptLoaded = false;

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
          'Authorization': `Bearer ${getAuthToken()}`
        },
        credentials: 'include',
      });
      goto('/');
    }
  
    let handleSubmit = (e) => {
      e.preventDefault();
      let dataToSend = {
        "latitude": latitude,
        "longitude": longitude,
        "radius": radius,
        "listSize": numToShow
      }

      fetch(`${apiBaseUrl}/maps/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        credentials: 'include',
        body: JSON.stringify(dataToSend)
      })
      .then(response => response.json())
      .then(data => {
        setRestaurantsList(data);
        goto('/bracket');
      })
      .catch(error => {
        console.error('Error fetching restaurants:', error);
      })
    }

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
      width: 66.66%;
      height: 400px;
      margin: 20px auto;
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

    .coordinates {
      width: 66.66%; 
      margin: 0 auto;  
      padding-left: 5px; 
      margin-top: 16px; 
    }

    :global(body) {
      margin: 0;
      padding: 0;
      min-height: 100vh;
    }
  </style>