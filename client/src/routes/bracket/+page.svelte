<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import Checkmark from '$lib/svg/checkmark.svelte';
	import { getRestaurantsList, setRestaurantsList } from '$lib/stores/bracketStore.svelte.js';
	import { apiBaseUrl } from '$lib/index.js';
	import { getAuthToken } from '$lib/stores/userStore.svelte.js';
	import RestaurantCard from '$lib/components/RestaurantCard.svelte';

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
	let scoreboard: { [key: number]: number } = {};
	let showScoreboard = false;
	let starting = true;

	function getNextPair() {
		currentPair = [];
		if (restaurants.length >= 2) {
			currentPair = restaurants.splice(0, 2);
		} else if (winners.length >= 2) {
			currentPair = winners.splice(0, 2);
		} else {
			showScoreboard = true;
		}

		currentPair = [...currentPair];
		restaurants = [...restaurants];
	}

	function tieBreaker() {
		// Group restaurants by their scores
		const scoreGroups: { [score: number]: Restaurant[] } = {};

		allRestaurants.forEach((restaurant) => {
			const score = scoreboard[restaurant.id] || 0;
			if (!scoreGroups[score]) {
				scoreGroups[score] = [];
			}
			scoreGroups[score].push(restaurant);
		});

		// Find the highest score that has ties
		let highestScoreWithTies = -1;
		Object.entries(scoreGroups).forEach(([score, restaurants]) => {
			if (restaurants.length > 1 && Number(score) > highestScoreWithTies) {
				highestScoreWithTies = Number(score);
			}
		});

		// If no ties found, show scoreboard
		if (highestScoreWithTies === -1) {
			showScoreboard = true;
			return;
		}

		// Get the tied restaurants for the highest score
		const tiedRestaurants = scoreGroups[highestScoreWithTies];

		// Increment scores for all restaurants with higher scores
		allRestaurants.forEach((restaurant) => {
			const score = scoreboard[restaurant.id] || 0;
			if (score > highestScoreWithTies) {
				scoreboard[restaurant.id] = score + 1;
			}
		});

		// Set up the next pair from tied restaurants
		if (tiedRestaurants.length >= 2) {
			currentPair = tiedRestaurants.splice(0, 2);
			winners = tiedRestaurants.splice(2);
		} else {
			showScoreboard = true;
		}
	}

	function selectWinner(winner: Restaurant) {
		if (starting) {
			let temp = restaurants.splice(0, 2);
			starting = false;
		}
		if (isTransitioning) return;
		isTransitioning = true;

		// Increment winner's score
		scoreboard[winner.id] = (scoreboard[winner.id] || 0) + 1;

		setTimeout(() => {
			flippedCards = {};
			winners = [...winners, winner];
			currentRound = currentRound + 1;
			currentPair = [];

			if (restaurants.length < 2) {
				if (winners.length == 1) {
					tieBreaker();
				} else {
					getNextPair();
				}
			} else {
				getNextPair();
			}
			isTransitioning = false;
		}, 10);
	}

	// Get sorted restaurants by score
	$: sortedRestaurants = allRestaurants
		.slice()
		.sort((a, b) => (scoreboard[b.id] || 0) - (scoreboard[a.id] || 0));

	function toggleCard(restaurant: Restaurant, event?: Event) {
		if (event) {
			event.stopPropagation();
		}
		flippedCards[restaurant.id] = !flippedCards[restaurant.id];
	}

	onMount(() => {
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
			description: restaurant.description || `Rating: ${restaurant.rating}`,
			hours: restaurant.hours || {},
			website: restaurant.website || '',
			mapsLink: restaurant.mapsLink || '',
			reviewsData: Array.isArray(restaurant.reviews) ? restaurant.reviews : []
		}));

		// console.log('RESTAURANTS: ', allRestaurants);
		restaurants = [...allRestaurants];

		// Initialize scoreboard with 0 points for each restaurant
		allRestaurants.forEach((restaurant) => {
			scoreboard[restaurant.id] = 0;
		});

		// Update restaurants array with the new data

		// Get the first pair to start the bracket
		//getNextPair();

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
							'Authorization': `Bearer ${getAuthToken()}`
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

<div class="flex flex-col items-center justify-center min-h-screen p-4">
	{#if !showScoreboard}
		<h1 class="mb-8 text-4xl font-bold">
			Round {currentRound}
		</h1>

		<div class="relative w-full max-w-4xl">
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
	{:else}
		<div class="w-full max-w-4xl">
			<h1 class="mb-8 text-4xl font-bold text-center">Final Rankings</h1>
			<div class="space-y-4">
				{#each sortedRestaurants as restaurant, index}
					<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
						<div class="flex items-center space-x-4">
							<span
								class="text-2xl font-bold {index === 0
									? 'text-yellow-500'
									: index === 1
										? 'text-gray-500'
										: index === 2
											? 'text-amber-700'
											: 'text-gray-700'}"
							>
								#{index + 1}
							</span>
							<div>
								<h2 class="text-xl font-semibold">{restaurant.name}</h2>
							</div>
						</div>
						<div
							class="w-16 h-16 bg-center bg-cover rounded-full"
							style="background-image: url({restaurant.image})"
						></div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>