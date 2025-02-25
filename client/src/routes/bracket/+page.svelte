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
		address?: string;
		rating?: number;
		reviews?: number;
		priceLevel?: number;
		type?: string;
		description?: string;
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
			reviews: restaurant.reviews,
			priceLevel: restaurant.priceLevel,
			type: restaurant.type || 'Restaurant',
			description: restaurant.description || `Rating: ${restaurant.rating}, Reviews: ${restaurant.reviews}`
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
					<div class="flex flex-col">
						<div class="flip-card-container relative h-[300px] overflow-visible md:h-[500px]">
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="flip-card {flippedCards[restaurant.id] ? 'flipped' : ''} overflow-visible"
								on:click={(e) => toggleCard(restaurant, e)}
							>
								<div class="shadow-md flip-card-front">
									<div
										class="absolute inset-0 bg-center bg-cover transition-transform duration-300"
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
									<div class="h-full p-6 overflow-y-auto bg-white">
										<div class="flex flex-col justify-between h-full">
											<div>
												<h2 class="mb-2 text-2xl font-bold text-primary">{restaurant.name}</h2>
												<div class="flex items-center mb-4">
													{#if restaurant.rating}
														<div class="flex items-center mr-2">
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gold" class="bi bi-star-fill" viewBox="0 0 16 16">
																<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
															</svg>
															<span class="ml-1">{restaurant.rating}</span>
														</div>
													{/if}
													{#if restaurant.reviews}
														<div class="mr-2">
															<span>({restaurant.reviews} reviews)</span>
														</div>
													{/if}
													{#if restaurant.priceLevel}
														<div>
															<span>{new Array(restaurant.priceLevel || 0).fill('$').join('')}</span>
														</div>
													{/if}
												</div>
												
												{#if restaurant.type}
													<p class="mb-2 font-medium text-gray-600">{restaurant.type}</p>
												{/if}
												
												{#if restaurant.address}
													<div class="flex items-start mb-2">
														<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="flex-shrink-0 mt-1 mr-1 bi bi-geo-alt" viewBox="0 0 16 16">
															<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
														</svg>
														<p class="text-gray-700">{restaurant.address}</p>
													</div>
												{/if}
												
												{#if restaurant.description}
													<p class="mb-3 text-gray-700">{restaurant.description}</p>
												{/if}
												
												<!-- Price estimate -->
												{#if restaurant.priceLevel}
													<div class="mb-3">
														<h3 class="text-sm font-semibold text-gray-700">Cost per person</h3>
														<p class="text-gray-700">
															{restaurant.priceLevel === 1 ? 'Under $10' : 
															restaurant.priceLevel === 2 ? '$11-$30' :
															restaurant.priceLevel === 3 ? '$31-$60' :
															restaurant.priceLevel === 4 ? 'Over $61' : 'Varies'}
														</p>
													</div>
												{/if}
												
												<!-- Hours Information -->
												<div class="mb-3">
													<h3 class="text-sm font-semibold text-gray-700">Hours</h3>
													<details class="text-sm text-gray-700">
														<summary class="cursor-pointer hover:text-primary">View hours</summary>
														<ul class="pl-4 mt-1">
															<li>Monday: 11:00 AM - 10:00 PM</li>
															<li>Tuesday: 11:00 AM - 10:00 PM</li>
															<li>Wednesday: 11:00 AM - 10:00 PM</li>
															<li>Thursday: 11:00 AM - 10:00 PM</li>
															<li>Friday: 11:00 AM - 11:00 PM</li>
															<li>Saturday: 11:00 AM - 11:00 PM</li>
															<li>Sunday: 12:00 PM - 9:00 PM</li>
														</ul>
													</details>
												</div>
												
												<!-- Menu Highlights -->
												<div class="mb-4">
													<h3 class="text-sm font-semibold text-gray-700">Menu Highlights</h3>
													<div class="mt-1 grid grid-cols-2 gap-2">
														<div class="p-2 text-xs bg-gray-100 rounded-md">
															<span class="font-medium">{restaurant.type === 'Restaurant' ? 'House Special' : restaurant.type === 'Café' ? 'Signature Coffee' : restaurant.type === 'Bakery' ? 'Fresh Bread' : 'Specialty Dish'}</span>
															<div class="flex items-center mt-1">
																<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="gold" class="bi bi-star-fill" viewBox="0 0 16 16">
																	<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
																</svg>
																<span class="ml-1">Popular</span>
															</div>
														</div>
													</div>
												</div>
												
												<!-- Action Buttons -->
												<div class="flex flex-wrap mb-3 gap-2">
													<a href="#" class="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/80">
														<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="mr-1 bi bi-menu-button-wide" viewBox="0 0 16 16">
															<path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v2A1.5 1.5 0 0 1 14.5 5h-13A1.5 1.5 0 0 1 0 3.5zM1.5 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5z"/>
															<path d="M2 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m10.823.323-.396-.396A.25.25 0 0 1 12.604 2h.792a.25.25 0 0 1 .177.427l-.396.396a.25.25 0 0 1-.354 0M0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2zm0-1h14v-2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1zm2.5-6.5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm7 0a.5.5 0 0 0 0 1h1.5a.5.5 0 0 0 0-1z"/>
														</svg>
														Menu
													</a>
													<a href="#" class="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
														<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="mr-1 bi bi-geo-alt" viewBox="0 0 16 16">
															<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
															<path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
														</svg>
														Directions
													</a>
													<a href="#" class="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
														<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="mr-1 bi bi-calendar-check" viewBox="0 0 16 16">
															<path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
															<path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
														</svg>
														Reserve
													</a>
												</div>
											</div>
											<div
												class="flex justify-center mt-4"
												on:click={(e) => {
													e.stopPropagation();
													selectWinner(restaurant);
												}}
											>
												<Button class="w-12 h-12 bg-green-500 rounded-full">
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
