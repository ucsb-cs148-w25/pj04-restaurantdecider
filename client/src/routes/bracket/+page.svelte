<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import Checkmark from '$lib/svg/checkmark.svelte';

	interface Restaurant {
		id: number;
		name: string;
		image: string;
		description: string;
	}

	let n = 8;
	// Sample restaurant data
	const allRestaurants: Restaurant[] = Array(n)
		.fill(null)
		.map((_, i) => ({
			id: i + 1,
			name: `Restaurant ${i + 1}`,
			image: `/placeholder.svg?height=400&width=300`,
			description: `Description for Restaurant ${i + 1}`
		}));

	let restaurants = [...allRestaurants]; // Create a copy for the tournament
	let currentPair: Restaurant[] = [];
	let winners: Restaurant[] = [];
	let currentRound = 1;
	let tierRound = 1;
	let selectedRestaurant: Restaurant | null = null;
	let isTransitioning = false;
	let flippedCards: { [key: number]: boolean } = {};
	let scoreboard: { [key: number]: number } = {};
	let showScoreboard = false;

	// Initialize scoreboard with 0 points for each restaurant
	allRestaurants.forEach(restaurant => {
		scoreboard[restaurant.id] = 0;
	});

	$: console.log('Current Round:', currentRound);

	function getNextPair() {
		console.log('Get next Pair Inside Current Round:', currentRound);
		if (restaurants.length >= 2) {
			currentPair = restaurants.splice(0, 2);
		} else if (winners.length >= 2) {
			currentPair = winners.splice(0, 2);
		} else{
			showScoreboard = true;
		}
		//if (tierRound === 1) {
		//	if (restaurants.length >= 2) {
		//		currentPair = restaurants.splice(0, 2);
		//	} else if (winners.length >= 2) {
		//		tierRound++;
		//		currentPair = winners.splice(0, 2);
		//	}
		//} else {
		//	if (winners.length >= 2) {
		//		currentPair = winners.splice(0, 2);
		//	}
		//}
		currentPair = [...currentPair];
	}

	function tieBreaker() {
		// Group restaurants by their scores
		const scoreGroups: { [score: number]: Restaurant[] } = {};
		
		allRestaurants.forEach(restaurant => {
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
		allRestaurants.forEach(restaurant => {
			const score = scoreboard[restaurant.id] || 0;
			if (score > highestScoreWithTies) {
				scoreboard[restaurant.id] = score + 1;
			}
		});

		// Set up the next pair from tied restaurants
		if (tiedRestaurants.length >= 2) {
			currentPair = tiedRestaurants.slice(0, 2);
			winners = tiedRestaurants.slice(2);
		} else {
			showScoreboard = true;
		}
	}

	function selectWinner(winner: Restaurant) {
		console.log('Select Winner Inside Current Round:', currentRound);

		if (isTransitioning) return;
		isTransitioning = true;

		// Increment winner's score
		
		scoreboard[winner.id] = (scoreboard[winner.id] || 0) + 1;
		console.log("Scoreboard:", scoreboard[winner.id]);

		setTimeout(()=> {
			winners = [...winners, winner];
			currentRound = currentRound + 1;  
			currentPair = [];
			
			if (restaurants.length == 0) {
				if (winners.length == 1) {
					tieBreaker();
					//showScoreboard = true;
				} else{
					getNextPair();
				}
			} else {
				getNextPair();
			}
			//if (winners.length === n/2 && tierRound === 1) {
			//	tierRound = 2;
			//} else if (winners.length === n/4 && tierRound === 2) {
			//	tierRound = 3;
			//} else if (winners.length === 2 && tierRound === 3) {
			//	tierRound = 4;
			//}

			// Check if we should show the scoreboard
			//if (tierRound === 4 && winners.length < 2) {
			//	showScoreboard = true;
			//} else if (tierRound === 4) {
			//	currentPair = [...winners];
			//} else {
			//	getNextPair();
			//}

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
		getNextPair();
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
											<div class="flex justify-center"  on:click={() => selectWinner(restaurant)}>
												<Button
													class="h-12 w-12 rounded-full bg-green-500"
													
												>
													<Checkmark/>
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
					<div class="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
						<div class="flex items-center space-x-4">
							<span class="text-2xl font-bold {index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-500' : index === 2 ? 'text-amber-700' : 'text-gray-700'}">
								#{index + 1}
							</span>
							<div>
								<h2 class="text-xl font-semibold">{restaurant.name}</h2>
								<p class="text-gray-600">Score: {scoreboard[restaurant.id]}</p>
							</div>
						</div>
						<div 
							class="w-16 h-16 bg-cover bg-center rounded-full"
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
