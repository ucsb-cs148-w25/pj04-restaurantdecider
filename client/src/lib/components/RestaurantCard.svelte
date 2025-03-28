<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Checkmark from '$lib/svg/checkmark.svelte';
	import { onMount, afterUpdate } from 'svelte';
	
	export let restaurant;
	export let flipped = false;
	export let onToggle = () => {};
	export let onSelectWinner = () => {};
	
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
	
	// Reference to the scrollable content div
	let scrollableContent;
	let prevRestaurantId;
	let prevFlippedState = flipped;
	let hoursDetails;
	
	// Reset scroll position when restaurant changes or card flips
	afterUpdate(() => {
		if (scrollableContent && 
			(prevRestaurantId !== restaurant.id || prevFlippedState !== flipped)) {
			scrollableContent.scrollTop = 0;
			prevRestaurantId = restaurant.id;
			prevFlippedState = flipped;
			
			// Ensure hours details is collapsed when restaurant changes or card flips
			if (hoursDetails) {
				hoursDetails.removeAttribute('open');
			}
		}
	});
</script>

<div class="flex flex-col">
	<div class="flip-card-container relative h-[300px] overflow-visible md:h-[500px]">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flip-card {flipped ? 'flipped' : ''} overflow-visible"
			on:click={(e) => onToggle(restaurant, e)}
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
				<div class="h-full p-6 overflow-y-auto bg-white" bind:this={scrollableContent}>
					<div class="flex flex-col justify-between h-full">
						<div>
							<h2 class="mb-2 text-2xl font-bold text-primary">{restaurant.name}</h2>
							<div class="flex items-center mb-4">
								{#if restaurant.rating}
									<div class="flex items-center mr-2">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gold" class="bi bi-star-fill" viewBox="0 0 16 16">
											<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
										</svg>
										<span class="text-gray-700">{restaurant.rating}</span>
									</div>
								{/if}
								{#if restaurant.reviews}
									<div class="mr-2">
										<span class="text-gray-700">({typeof restaurant.reviews === 'number' ? restaurant.reviews : 'No'} reviews)</span>
									</div>
								{/if}
								{#if restaurant.priceLevel}
									<div>
										<span class="text-gray-700"> {new Array(restaurant.priceLevel || 0).fill('$').join('')}</span>
									</div>
								{/if}
							</div>
							
							{#if restaurant.type}
								<p class="mb-2 font-medium text-gray-600">{restaurant.type}</p>
							{/if}
							
							{#if restaurant.address}
								<div class="flex items-start mb-2">
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="gray" class="flex-shrink-0 mt-1 mr-1 bi bi-geo-alt" viewBox="0 0 16 16">
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
								<div>
									<h3 class="text-sm font-semibold text-gray-700">Price Level</h3>
									<span class="text-gray-700">{new Array(restaurant.priceLevel || 0).fill('$').join('')}</span>
								</div>
							{/if}
							
							<!-- Hours Information -->
							<div class="mb-3">
								<h3 class="text-sm font-semibold text-gray-700">Hours</h3>
								<details class="text-sm text-gray-700" bind:this={hoursDetails}>
									<summary class="cursor-pointer hover:text-primary" on:click={(e) => e.stopPropagation()}>View hours</summary>
									<ul class="pl-4 mt-1">
										{#if restaurant.hours && restaurant.hours.weekdayDescriptions && restaurant.hours.weekdayDescriptions.length > 0}
											{#each restaurant.hours.weekdayDescriptions as day}
												<li>{day}</li>
											{/each}
										{:else}
											<li>Hours Unavailable</li>
										{/if}
									</ul>
								</details>
							</div>

							<!-- Reviews Section (if available) -->
							{#if restaurant.reviewsData && restaurant.reviewsData.length > 0}
								<div class="mb-4">
									<h3 class="text-sm font-semibold text-gray-700">Reviews</h3>
									<div class="mt-2">
										{#each restaurant.reviewsData.slice(0, 1) as review}
											<div class="mb-2 p-2 bg-gray-50 rounded-md text-xs">
												{#if review.authorAttribution}
													<div class="flex items-center mb-1">
														<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="black" class="bi bi-person-circle mr-1" viewBox="0 0 16 16">
															<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
															<path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 1-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 1 8 1"/>
														</svg>
														<span class="font-medium text-black font-semibold">{review.authorAttribution.displayName || 'Anonymous'}</span>
													</div>
												{/if}
												
												<!-- Review rating -->
												{#if review.rating}
													<div class="flex items-center mb-1">
														{#each Array(5) as _, i}
															{#if i < review.rating}
																<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="gold" class="bi bi-star-fill" viewBox="0 0 16 16">
																	<path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
																</svg>
															{:else}
																<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
																	<path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.282.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
																</svg>
															{/if}
														{/each}
													</div>
												{/if}
												
												<!-- Review text -->
												<p class="text-gray-700">{review.text ? review.text.text : 'No review text available'}</p>
												
												<!-- Review date if available -->
												{#if review.relativePublishTimeDescription}
													<p class="text-gray-500 mt-1 text-xs">{review.relativePublishTimeDescription}</p>
												{/if}
											</div>
										{/each}
									</div>
								</div>
							{/if}
							
							<!-- Action Buttons -->
							<div class="flex flex-wrap mb-3 gap-2">
								{#if restaurant.website}
								<a 
									href={restaurant.website} 
									target="_blank" 
									rel="noopener noreferrer" 
									class="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/80"
									on:click={(e) => e.stopPropagation()}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="mr-1 bi bi-menu-button-wide" viewBox="0 0 16 16">
										<path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h13A1.5 1.5 0 0 1 16 1.5v2A1.5 1.5 0 0 1 14.5 5h-13A1.5 1.5 0 0 1 0 3.5zM1.5 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5z"/>
										<path d="M2 2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m10.823.323-.396-.396A.25.25 0 0 1 12.604 2h.792a.25.25 0 0 1 .177.427l-.396.396a.25.25 0 0 1-.354 0M0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2zm0-1h14v-2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1zm2.5-6.5a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm7 0a.5.5 0 0 0 0 1h1.5a.5.5 0 0 0 0-1z"/>
									</svg>
									Menu
								</a>
								{/if}
								<a 
									href={restaurant.mapsLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + (restaurant.address || ''))}`} 
									target="_blank" 
									rel="noopener noreferrer" 
									class="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
									on:click={(e) => e.stopPropagation()}
								>
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="mr-1 bi bi-geo-alt" viewBox="0 0 16 16">
										<path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10"/>
										<path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4m0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
									</svg>
									Directions
								</a>
							</div>
						</div>
						{#if typeof onSelectWinner === 'function' && onSelectWinner.toString() !== '() => {}'}
						<div
							class="flex justify-center mt-4 pb-2"
							on:click={(e) => {
								e.stopPropagation();
								onSelectWinner(restaurant);
							}}
						>
							<Button class="w-12 h-12 bg-green-500 rounded-full">
								<Checkmark />
							</Button>
						</div>
						{/if}
					</div>
				</div>
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