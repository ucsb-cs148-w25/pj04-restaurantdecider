<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import ArrowRight from '$lib/icons/arrow_right.svelte';
	import ChevronLeft from '$lib/icons/chevron_left.svelte';
	import ArrowLeft from '$lib/icons/arrow_left.svelte';

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
					<div class="flip-card-container relative h-[300px] md:h-[500px]">
						<div
							class="flip-card {flippedCards[restaurant.id] ? 'flipped' : ''}"
							on:click={(e) => toggleCard(restaurant, e)}
						>
							<div class="flip-card-front">
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
								<div class="flex h-full flex-col bg-white p-6">
									<h2 class="mb-4 text-2xl font-bold text-primary">{restaurant.name}</h2>
									<p class="text-gray-700">{restaurant.description}</p>
								</div>
							</div>
						</div>
					</div>
					<Button
						variant="ghost"
						class="mt-4 flex-1 justify-center bg-primary/80 py-6 text-white hover:bg-primary/90"
						on:click={() => selectWinner(restaurant)}
					>
						{#if i === 0}
							<ArrowLeft class="w-18 h-6" />
						{:else}
							<ArrowRight class="w-18 h-6" />
						{/if}
					</Button>
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
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
	}
</style>
