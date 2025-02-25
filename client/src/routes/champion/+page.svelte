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
	let champion: Restaurant | null = null;
	let showChampion = false;
	let starting = true;

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
		if (starting) {
			let temp = restaurants.splice(0, 2);
			starting = false;
		}
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

		// console.log(allRestaurants);
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

<div class="flex min-h-screen flex-col items-center justify-center p-4">
	{#if !showChampion}
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
									<div class="h-full bg-white p-6 overflow-y-auto">
										<div class="flex h-full flex-col justify-between">
											<div>
												<h2 class="mb-2 text-2xl font-bold text-primary">{restaurant.name}</h2>
												<div class="mb-4 flex items-center">
													{#if restaurant.rating}
														<div class="mr-2 flex items-center">
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
													<p class="mb-2 text-gray-600 font-medium">{restaurant.type}</p>
												{/if}
												
												{#if restaurant.address}
													<div class="mb-2 flex items-start">
														<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt mt-1 mr-1 flex-shrink-0" viewBox="0 0 16 16">
															<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
														</svg>
														<p class="text-gray-700">{restaurant.address}</p>
													</div>
												{/if}
												
												{#if restaurant.description}
													<p class="mb-3 text-gray-700">{restaurant.description}</p>
												{/if}
											</div>
											<div
												class="flex justify-center mt-4"
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
	{:else if champion}
		<div class="w-full max-w-4xl">
			<h1 class="mb-8 text-center text-4xl font-bold">Champion</h1>
			<div class="space-y-4">
				<div class="flip-card-container relative mx-auto h-[500px] w-full max-w-lg overflow-visible">
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="flip-card {flippedCards[champion.id] ? 'flipped' : ''} overflow-visible"
						on:click={(e) => toggleCard(champion, e)}
					>
						<div class="flip-card-front shadow-md">
							<div
								class="absolute inset-0 bg-cover bg-center transition-transform duration-300"
								style="background-image: url({champion.image})"
							>
								<div class="absolute inset-0 bg-black/40" />
							</div>
							<div class="absolute bottom-0 left-0 right-0 p-6">
								<h2 class="text-3xl font-bold text-white">
									{champion.name}
								</h2>
							</div>
						</div>
						<div class="flip-card-back">
							<div class="h-full bg-white p-6 overflow-y-auto">
								<div class="flex h-full flex-col justify-between">
									<div>
										<h2 class="mb-2 text-3xl font-bold text-primary">{champion.name}</h2>
										<div class="mb-4 flex items-center">
											{#if champion.rating}
												<div class="mr-2 flex items-center">
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gold" class="bi bi-star-fill" viewBox="0 0 16 16">
														<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
													</svg>
													<span class="ml-1">{champion.rating}</span>
												</div>
											{/if}
											{#if champion.reviews}
												<div class="mr-2">
													<span>({champion.reviews} reviews)</span>
												</div>
											{/if}
											{#if champion.priceLevel}
												<div>
													<span>{new Array(champion.priceLevel || 0).fill('$').join('')}</span>
												</div>
											{/if}
										</div>
										
										{#if champion.type}
											<p class="mb-2 text-gray-600 font-medium">{champion.type}</p>
										{/if}
										
										{#if champion.address}
											<div class="mb-2 flex items-start">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt mt-1 mr-1 flex-shrink-0" viewBox="0 0 16 16">
													<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
												</svg>
												<p class="text-gray-700">{champion.address}</p>
											</div>
										{/if}
										
										{#if champion.description}
											<p class="mb-3 text-gray-700">{champion.description}</p>
										{/if}
										
										<!-- Price estimate -->
										{#if champion.priceLevel}
											<div class="mb-3">
												<h3 class="text-sm font-semibold text-gray-700">Cost per person</h3>
												<p class="text-gray-700">
													{champion.priceLevel === 1 ? 'Under $10' : 
													champion.priceLevel === 2 ? '$11-$30' :
													champion.priceLevel === 3 ? '$31-$60' :
													champion.priceLevel === 4 ? 'Over $61' : 'Varies'}
												</p>
											</div>
										{/if}
										
										<!-- Hours Information -->
										<div class="mb-3">
											<h3 class="text-sm font-semibold text-gray-700">Hours</h3>
											<details class="text-gray-700 text-sm">
												<summary class="cursor-pointer hover:text-primary">View hours</summary>
												<ul class="mt-1 pl-4">
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
												<div class="rounded-md bg-gray-100 p-2 text-xs">
													<span class="font-medium">{champion.type === 'Restaurant' ? 'House Special' : champion.type === 'Café' ? 'Signature Coffee' : champion.type === 'Bakery' ? 'Fresh Bread' : 'Specialty Dish'}</span>
													<div class="mt-1 flex items-center">
														<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="gold" class="bi bi-star-fill" viewBox="0 0 16 16">
															<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
														</svg>
														<span class="ml-1">Popular</span>
													</div>
												</div>
												<div class="rounded-md bg-gray-100 p-2 text-xs">
													<span class="font-medium">Chef's Choice</span>
													<div class="mt-1 flex items-center">
														<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-award text-amber-600" viewBox="0 0 16 16">
															<path d="M9.669.864 8 0 6.331.864l-1.858.282-.842 1.68-1.337 1.32L2.6 6l-.306 1.854 1.337 1.32.842 1.68 1.858.282L8 12l1.669-.864 1.858-.282.842-1.68 1.337-1.32L13.4 6l.306-1.854-1.337-1.32-.842-1.68zm1.196 1.193.684 1.365 1.086 1.072L12.387 6l.248 1.506-1.086 1.072-.684 1.365-1.51.229L8 10.874l-1.355-.702-1.51-.229-.684-1.365-1.086-1.072L3.614 6l-.25-1.506 1.087-1.072.684-1.365 1.51-.229L8 1.126l1.356.702z"/>
															<path d="M4 11.794V16l4-1 4 1v-4.206l-2.018.306L8 13.126 6.018 12.1z"/>
														</svg>
														<span class="ml-1">Award-winning</span>
													</div>
												</div>
											</div>
										</div>
										
										<!-- Action Buttons -->
										<div class="mb-4 flex flex-wrap gap-2">
											<a href="#" class="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/80">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-menu-button-wide mr-1" viewBox="0 0 16 16">
													<path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v2A1.5 1.5 0 0 1 14.5 5h-13A1.5 1.5 0 0 1 0 3.5zM1.5 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5z"/>
													<path d="M2 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m10.823.323-.396-.396A.25.25 0 0 1 12.604 2h.792a.25.25 0 0 1 .177.427l-.396.396a.25.25 0 0 1-.354 0M0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2zm0-1h14v-2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1zm2.5-6.5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm7 0a.5.5 0 0 0 0 1h1.5a.5.5 0 0 0 0-1z"/>
												</svg>
												View Menu
											</a>
											<a href="#" class="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt mr-1" viewBox="0 0 16 16">
													<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
													<path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
												</svg>
												Directions
											</a>
											<a href="#" class="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700">
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-check mr-1" viewBox="0 0 16 16">
													<path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
													<path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
												</svg>
												Reserve
											</a>
										</div>
										
										<!-- Divider -->
										<div class="relative my-5">
											<div class="absolute inset-0 flex items-center">
												<div class="w-full border-t border-gray-300"></div>
											</div>
											<div class="relative flex justify-center text-sm">
												<span class="bg-white px-2 text-gray-500">Customer Reviews</span>
											</div>
										</div>
										
										<!-- Reviews Section -->
										<div class="mb-3">
											<div class="mb-3 rounded-lg bg-gray-50 p-3">
												<div class="flex items-center">
													<div class="mr-2 flex">
														{#each Array(5) as _, i}
															<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill={i < 5 ? "gold" : "currentColor"} class="bi bi-star-fill" viewBox="0 0 16 16">
																<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
															</svg>
														{/each}
													</div>
													<div>
														<span class="text-xs font-semibold">Sarah M.</span>
														<span class="text-xs text-gray-500 ml-2">2 weeks ago</span>
													</div>
												</div>
												<p class="mt-1 text-xs text-gray-700">
													"Amazing food and excellent service! The {champion.type || 'restaurant'} has a great atmosphere and the staff is incredibly friendly. Would definitely recommend!"
												</p>
											</div>
											
											<div class="rounded-lg bg-gray-50 p-3">
												<div class="flex items-center">
													<div class="mr-2 flex">
														{#each Array(5) as _, i}
															<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill={i < 4 ? "gold" : "currentColor"} class="bi bi-star-fill" viewBox="0 0 16 16">
																<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
															</svg>
														{/each}
													</div>
													<div>
														<span class="text-xs font-semibold">John D.</span>
														<span class="text-xs text-gray-500 ml-2">1 month ago</span>
													</div>
												</div>
												<p class="mt-1 text-xs text-gray-700">
													"Great value for the price! The food was perfectly prepared and the portions were generous. Can't wait to come back and try more menu items."
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
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