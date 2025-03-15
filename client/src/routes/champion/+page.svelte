<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import Checkmark from '$lib/svg/checkmark.svelte';
	import { getRestaurantsList, setRestaurantsList } from '$lib/stores/bracketStore.svelte.js';
	import { apiBaseUrl } from '$lib/index.js';
	import { getAuthToken } from '$lib/stores/userStore.svelte.js';
	import RestaurantCard from '$lib/components/RestaurantCard.svelte';
	import { Divide } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import LogoNoMove from '$lib/images/WEAT_unmoving.png';

	interface Restaurant {
		id: number;
		name: string;
		image: string;
		address?: string;
		rating?: number;
		reviews?: number;
		priceLevel?: number;
		type?: string;
		description?: string;
		hours?: any;
		website?: string;
		mapsLink?: string;
		reviewsData?: any[];
	}

	let allRestaurants: Restaurant[] = [];
	let restaurants: Restaurant[] = [];
	let currentPair: Restaurant[] = [];
	let winners: Restaurant[] = [];
	let currentRound = 1;
	let isTransitioning = false;
	let flippedCards: { [key: number]: boolean } = {};
	let champion: Restaurant | null = null;
	let showChampion = false;

	function getNextPair() {
		if (restaurants.length >= 2) {
			currentPair = restaurants.splice(0, 2);
		} else if (winners.length >= 2) {
			currentPair = winners.splice(0, 2);
		} else if (winners.length === 1 && restaurants.length === 1) {
			currentPair = [...winners, ...restaurants];
			winners = [];
			restaurants = [];
		} else if (winners.length === 1) {
			champion = winners[0];
			showChampion = true;
		}
	}

	function selectWinner(winner: Restaurant) {
		if (isTransitioning) return;
		isTransitioning = true;

		setTimeout(() => {
			flippedCards = {};
			winners = [...winners, winner];
			currentRound = currentRound + 1;
			if (winners.length === 1 && restaurants.length === 0) {
				champion = winners[0];
				showChampion = true;
			} else {
				getNextPair();
			}
			isTransitioning = false;
		}, 1000);
	}

	function toggleCard(restaurant: Restaurant, event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		flippedCards[restaurant.id] = !flippedCards[restaurant.id];
	}

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

	onMount(() => {

		const authToken = getAuthToken();
		if (!authToken) {
			goto('/');
			return;
		}

		const restaurantsData = getRestaurantsList();

		allRestaurants = restaurantsData.restaurants.map((restaurant, index) => ({
			id: index + 1,
			name: restaurant.name,
			image: restaurant.menuImages[0] || '/placeholder.svg?height=400&width=300',
			address: restaurant.address,
			rating: restaurant.rating,
			reviews: typeof restaurant.userRatingCount === 'number' ? restaurant.userRatingCount : 
					(typeof restaurant.reviews === 'object' && restaurant.reviews ? 
					 (restaurant.reviews.length || 0) : 0),
			priceLevel: restaurant.priceLevel,
			type: restaurant.type || 'Restaurant',
			description: restaurant.description,
			hours: restaurant.hours || {},
			website: restaurant.website || '',
			mapsLink: restaurant.mapsLink || '',
			reviewsData: Array.isArray(restaurant.reviews) ? restaurant.reviews : []
		}));

		//console.log(allRestaurants);
		restaurants = [...allRestaurants];

		// Load images after initial mount
		let loadedImages = 0;
		const totalImages = restaurantsData.restaurants.length;

		restaurantsData.restaurants.forEach(async (restaurant, index) => {
			if (restaurant.menuImages && restaurant.menuImages[0]) {
				try {
					const response = await fetch(`${apiBaseUrl}/maps/restaurantphoto`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${getAuthToken()}`
						},
						credentials: 'include',
						body: JSON.stringify({
							resource_id: restaurant.menuImages[0],
							max_width_px: 400
						})
					});
					if (response.ok) {
						const imageUrl = URL.createObjectURL(await response.blob());
						allRestaurants[index].image = imageUrl;
						restaurants = [...allRestaurants]; // Trigger reactivity
					}
				} catch (error) {
					console.error('Error fetching restaurant photo:', error);
				}
			}
			loadedImages++;

			// Once all images are processed (either loaded or failed), get the first pair
			if (loadedImages === totalImages) {
				getNextPair();
			}
		});
	});
</script>

<header class="absolute top-0 left-0 right-0 flex justify-between p-4">
	<a href="/"><img src={LogoNoMove} alt="Logo" style="width: 8rem"></a>
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

<div class="flex flex-col items-center justify-center min-h-screen pt-16">
	{#if !showChampion}
		<h1 class="mb-8 text-4xl font-bold">
			Round {currentRound}
		</h1>

		<div class="relative w-full max-w-4xl pb-24">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				{#each currentPair as restaurant, i}
					<RestaurantCard 
						{restaurant} 
						flipped={flippedCards[restaurant.id]} 
						onToggle={toggleCard} 
						onSelectWinner={selectWinner} 
					/>
				{/each}
			</div>
		</div>
	{:else if champion}
		<div class="w-full max-w-4xl pb-24">
			<h1 class="mb-8 text-4xl font-bold text-center">Champion</h1>
			<div class="space-y-4">
				<div class="relative mx-auto w-full max-w-lg">
					<RestaurantCard 
						restaurant={champion} 
						flipped={flippedCards[champion.id]} 
						onToggle={toggleCard} 
					/>
				</div>
			</div>
		</div>
	{/if}

	<div class="bottom-0 left-0 w-full flex justify-center">
		<div class="flex flex-col items-center">
			<div on:click={() => goto('/restaurant_search')}>
				<Button 
				variant="outline" 
				class="mb-8" 
			>
				Back to Search
			</Button>
			</div>
		</div>
	</div>
</div>


<style>
	.flip-card-container {
		perspective: 1500px;
	}

	.flip-card {
		position: relative;
		width: 100%;
		height: 100%;
		transform-style: preserve-3d;
		transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
	}

	.flip-card.flipped {
		transform: rotateY(180deg);
	}

	.flip-card-front,
	.flip-card-back {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		overflow: hidden;
		border-radius: 0.5rem;
	}

	.flip-card-front {
		background-color: #f3f4f6;
	}

	.flip-card-back {
		transform: rotateY(180deg);
		background-color: white;
	}
</style>
