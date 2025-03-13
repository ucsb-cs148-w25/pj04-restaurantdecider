<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import Checkmark from '$lib/svg/checkmark.svelte';
	import { getRestaurantsList, setRestaurantsList } from '$lib/stores/bracketStore.svelte.js';
	import { apiBaseUrl } from '$lib/index.js';
	import { getAuthToken, getUsername } from '$lib/stores/userStore.svelte.js';
	import RestaurantCard from '$lib/components/RestaurantCard.svelte';
	import { goto } from '$app/navigation';
	import LogoNoMove from '$lib/images/WEAT_unmoving.png';
	import { getSocket } from '$lib/socket.js';
	import { page } from '$app/stores';

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

	// Get roomId from the URL
	const roomId = $page.params.room_id;

	// Socket and state variables
	let socket = getSocket();
	let allRestaurants: Restaurant[] = [];
	let restaurants: Restaurant[] = [];
	let currentPair: Restaurant[] = [];
	let winners: Restaurant[] = [];
	let currentRound = 1;
	let isTransitioning = false;
	let flippedCards: { [key: number]: boolean } = {};
	let scoreboard: { [key: number]: number } = {};
	let showScoreboard = false;
	let submittedResults = false;
	let waitingForOthers = false;
	let finalGroupResults: any = null;
	let usersSubmitted = 0;
	let totalUsers = 0;
	let rankingStyle = 'bracket'; // Default to bracket mode
	let winningRestaurant: Restaurant | null = null; // Store the winning restaurant object

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

		// If no ties found, show scoreboard and submit results
		if (highestScoreWithTies === -1) {
			showScoreboard = true;
			submitResults();
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
			submitResults();
		}
	}

	// Function to submit results to the server
	function submitResults() {
		if (submittedResults) return; // Prevent multiple submissions

		// Find the winner (restaurant with highest score)
		const winner = sortedRestaurants.length > 0 ? sortedRestaurants[0] : null;

		// Prepare results object
		const results = {
			winner: winner ? winner.name : null,
			finalRound: sortedRestaurants.slice(0, 3).map((r) => r.name), // Top 3 restaurants
			rankings: sortedRestaurants.map((r) => ({
				name: r.name,
				score: scoreboard[r.id] || 0
			}))
		};

		// Submit results to server
		socket.emit('submitBracketResults', { roomId, results });

		// Update UI state
		submittedResults = true;
		waitingForOthers = true;
		console.log('Submitted bracket results:', results);
	}

	function selectWinner(winner: Restaurant) {
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
		// Handle user submission updates
		socket.on('userSubmittedResults', (data: { submittedCount: number; totalUsers: number }) => {
			console.log('User submitted results:', data);
			usersSubmitted = data.submittedCount;
			totalUsers = data.totalUsers;
		});

		// Handle lobby joined event to get lobby settings
		socket.on('joinedLobby', (data: { lobbySettings?: { rankingStyle?: string } }) => {
			console.log('Joined lobby with settings:', data);
			// Get ranking style from lobby settings
			if (data.lobbySettings && data.lobbySettings.rankingStyle) {
				rankingStyle = data.lobbySettings.rankingStyle;
				console.log('Ranking style set to:', rankingStyle);
			}
		});

		// Handle when all users have completed their brackets
		socket.on('bracketCompleted', (data: { finalResults: any; rankingStyle?: string }) => {
			console.log('Bracket completed:', data);
			finalGroupResults = data.finalResults;

			// Update ranking style if provided by the server
			if (data.rankingStyle) {
				rankingStyle = data.rankingStyle;
				console.log('Final ranking style set to:', rankingStyle);
			}

			// If we're in champion mode, find the winning restaurant from our list
			if (rankingStyle === 'champion' && finalGroupResults && finalGroupResults.winner) {
				winningRestaurant = allRestaurants.find((r) => r.name === finalGroupResults.winner) || null;
			}

			showScoreboard = true;
			waitingForOthers = false;
		});

		// Get restaurant data
		const restaurantsData: { restaurants: any[] } = getRestaurantsList() || { restaurants: [] };
		console.log(restaurantsData);

		allRestaurants = restaurantsData.restaurants.map((restaurant: any, index: number) => ({
			id: index + 1,
			name: restaurant.name,
			image: restaurant.menuImages[0] || '/placeholder.svg?height=400&width=300',
			address: restaurant.address,
			rating: restaurant.rating,
			reviews:
				typeof restaurant.userRatingCount === 'number'
					? restaurant.userRatingCount
					: typeof restaurant.reviews === 'object' && restaurant.reviews
						? restaurant.reviews.length || 0
						: 0,
			priceLevel: restaurant.priceLevel,
			type: restaurant.type || 'Restaurant',
			description: restaurant.description,
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

<header class="absolute left-0 right-0 top-0 flex justify-between p-4">
	<a href="/"><img src={LogoNoMove} alt="Logo" style="width: 8rem" /></a>
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

<div class="flex min-h-screen flex-col items-center justify-center pt-16">
	{#if !showScoreboard}
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

		<div class="bottom-0 left-0 flex w-full justify-center">
			<div class="flex flex-col items-center">
				<button on:click={() => goto('/restaurant_search')} class="w-full">
					<Button variant="outline" class="mb-8">Back to Search</Button>
				</button>
			</div>
		</div>
	{:else if waitingForOthers}
		<div class="w-full max-w-4xl">
			<h1 class="mb-8 text-center text-4xl font-bold">Waiting for other participants</h1>

			<div class="mb-8 rounded-lg bg-white p-6 text-center shadow-md">
				<p class="mb-4 text-xl text-black">Your results have been submitted!</p>
				<p class="text-lg text-black">
					{usersSubmitted} of {totalUsers} participants have completed their brackets
				</p>

				<!-- Progress bar -->
				<div class="mt-4 h-4 w-full rounded-full bg-gray-200">
					<div
						class="h-4 rounded-full bg-blue-600 transition-all duration-500"
						style="width: {(usersSubmitted / totalUsers) * 100}%"
					></div>
				</div>
			</div>

			<h2 class="mb-4 text-center text-2xl font-semibold">Your Rankings</h2>
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
								<h2 class="text-xl font-semibold text-black">{restaurant.name}</h2>
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
	{:else if finalGroupResults}
		<div class="w-full max-w-4xl">
			<h1 class="mb-8 text-center text-4xl font-bold">Group Results</h1>

			{#if rankingStyle === 'champion' && winningRestaurant}
				<!-- Champion style shows the winner with the restaurant card -->
				<div class="mb-4 text-center">
					<h2 class="mb-4 text-2xl font-semibold">🏆 Champion 🏆</h2>
				</div>

				<div class="mb-8 flex justify-center">
					<div class="w-full max-w-md">
						<RestaurantCard
							restaurant={winningRestaurant}
							flipped={true}
							onToggle={() => {}}
							onSelectWinner={() => {}}
						/>
					</div>
				</div>
			{:else}
				<!-- Bracket style shows the winner and full rankings -->
				<div class="mb-8 rounded-lg bg-white p-6 text-center shadow-md">
					<h2 class="mb-4 text-2xl font-semibold">🏆 Winner 🏆</h2>
					<p class="text-3xl font-bold text-yellow-500">{finalGroupResults.winner}</p>
				</div>

				{#if finalGroupResults.rankings && finalGroupResults.rankings.length > 0}
					<h2 class="mb-4 text-center text-2xl font-semibold">Full Rankings</h2>
					<div class="space-y-4">
						{#each finalGroupResults.rankings as ranking, index}
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
										<h2 class="text-xl font-semibold text-black">{ranking.name}</h2>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			{/if}

			<div class="mt-8 flex justify-center">
				<div class="flex flex-col items-center">
					<button on:click={() => goto('/restaurant_search')} class="w-full">
						<Button variant="outline" class="mb-8">Back to Search</Button>
					</button>
				</div>
			</div>
		</div>
	{:else}
		<div class="w-full max-w-4xl">
			<h1 class="mb-8 text-center text-4xl font-bold">Your Rankings</h1>
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
								<h2 class="text-xl font-semibold text-black">{restaurant.name}</h2>
							</div>
						</div>
						<div
							class="h-16 w-16 rounded-full bg-cover bg-center"
							style="background-image: url({restaurant.image})"
						></div>
					</div>
				{/each}
			</div>
			<div class="mt-8 flex justify-center">
				<div class="flex flex-col items-center">
					<button on:click={() => goto('/restaurant_search')} class="w-full">
						<Button variant="outline" class="mb-8">Back to Search</Button>
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
