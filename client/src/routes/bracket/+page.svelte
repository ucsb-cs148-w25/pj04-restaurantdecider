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

	// Sample restaurant data
	const restaurants: Restaurant[] = Array(16)
		.fill(null)
		.map((_, i) => ({
			id: i + 1,
			name: `Restaurant ${i + 1}`,
			image: `/placeholder.svg?height=400&width=300`,
			description: `Description for Restaurant ${i + 1}`
		}));

	let currentPair: Restaurant[] = [];
	let winners: Restaurant[] = [];
	let currentRound = 1;
	let selectedRestaurant: Restaurant | null = null;
	let isTransitioning = false;
	let flippedCards: { [key: number]: boolean } = {};

	function getNextPair() {
		if (currentRound === 1) {
			if (restaurants.length >= 2) {
				currentPair = restaurants.splice(0, 2);
			} else if (winners.length >= 2) {
				currentRound++;
				currentPair = winners.splice(0, 2);
			}
		} else {
			if (winners.length >= 2) {
				currentPair = winners.splice(0, 2);
			}
		}
	}

	function selectWinner(winner: Restaurant) {
		if (isTransitioning) return;
		isTransitioning = true;

		setTimeout(() => {
			winners.push(winner);
			if (winners.length === 8 && currentRound === 1) {
				currentRound = 2;
			} else if (winners.length === 4 && currentRound === 2) {
				currentRound = 3;
			} else if (winners.length === 2 && currentRound === 3) {
				currentRound = 4;
			}

			if (currentRound === 4) {
				currentPair = winners;
			} else {
				getNextPair();
			}
			isTransitioning = false;
		}, 500);
	}

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

<div class="flex min-h-screen items-center justify-center p-4">
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
										<div class="flex justify-center">
											<Button
												class="h-12 w-12 rounded-full bg-green-500"
												on:click={() => selectWinner(restaurant)}
											>
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
