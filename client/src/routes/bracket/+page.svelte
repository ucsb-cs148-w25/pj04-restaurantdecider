<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import Checkmark from '$lib/svg/checkmark.svelte';
	import { getRestaurantsList, setRestaurantsList } from '$lib/stores/bracketStore.svelte.js';
	import { apiBaseUrl } from '$lib/index.js';
	import { getAuthToken } from '$lib/stores/userStore.svelte.js';

	interface Restaurant {
		id: number;
		name: string;
		image: string;
		description: string;
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
			description: `Rating: ${restaurant.rating}, Reviews: ${restaurant.reviews}`
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

<div class="flex min-h-screen flex-col items-center justify-center p-4">
	{#if !showScoreboard}
		<h1 class="mb-8 text-4xl font-bold">
			Round {currentRound}
		</h1>

		<div class="relative w-full max-w-4xl">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				{#each currentPair as restaurant, i}
					<div class="flex flex-col">
						<div class="flip-card-container relative h-[300px] overflow-visible md:h-[500px]">
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="flip-card {flippedCards[restaurant.id] ? 'flipped' : ''} overflow-visible"
								on:click={(e) => toggleCard(restaurant, e)}
							>
								<div class="flip-card-front shadow-md">
									<div
										class="absolute inset-0 bg-cover bg-center transition-transform duration-300"
										style="background-image: url({restaurant.image})"
									>
										<div class="absolute inset-0 bg-black/40" />
									</div>
									<div class="absolute bottom-0 left-0 right-0 p-6">
										<h2 class="text-2xl font-bold text-white">
											{restaurant.name}
										</h2>
									</div>
								</div>
								<div class="flip-card-back">
									<div class="h-full bg-white p-6">
										<div class="flex h-full flex-col justify-between">
											<div>
												<h2 class="mb-4 text-2xl font-bold text-primary">{restaurant.name}</h2>
												<p class="text-gray-700">{restaurant.description}</p>
											</div>
											<div
												class="flex justify-center"
												on:click={(e) => {
													e.stopPropagation();
													selectWinner(restaurant);
												}}
											>
												<Button class="h-12 w-12 rounded-full bg-green-500">
													<Checkmark />
												</Button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="w-full max-w-4xl">
			<h1 class="mb-8 text-center text-4xl font-bold">Final Rankings</h1>
			<div class="space-y-4">
				{#each sortedRestaurants as restaurant, index}
					<div class="flex items-center justify-between rounded-lg bg-white p-4 shadow-md">
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
							class="h-16 w-16 rounded-full bg-cover bg-center"
							style="background-image: url({restaurant.image})"
						></div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
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
