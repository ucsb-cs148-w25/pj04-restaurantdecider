<script>
	import { onMount, onDestroy } from 'svelte';
	import { io } from 'socket.io-client';
	import { page } from '$app/stores';
	import { socketEndpoint } from '$lib/index.js';

	let socket;
	let messages = [];
	let messageInput = '';
	let roomId = $page.params.id || 'example-room-id'; // This should come from URL or user input
	let connected = false;
	let userId = '';
	let userCount = 0;

	onMount(() => {
		// Initialize socket connection
		socket = io(socketEndpoint);

		// Handle connection events
		socket.on('connect', () => {
			connected = true;
			userId = socket.id;
			console.log('Connected to Socket.IO server with ID:', userId);

			// Join the room
			joinRoom();
		});

		socket.on('disconnect', () => {
			connected = false;
			console.log('Disconnected from Socket.IO server');
		});

		// Handle room-specific events
		socket.on('userJoined', (data) => {
			console.log(`User ${data.userId} joined the room`);
			userCount = data.userCount || userCount + 1;
			messages = [...messages, { type: 'system', text: `User ${data.userId} joined the room` }];
		});

		socket.on('userLeft', (data) => {
			console.log(`User ${data.userId} left the room`);
			userCount = data.userCount || Math.max(0, userCount - 1);
			messages = [...messages, { type: 'system', text: `User ${data.userId} left the room` }];
		});

		socket.on('newMessage', (data) => {
			console.log(`New message from ${data.userId}: ${data.message}`);
			messages = [
				...messages,
				{
					type: data.userId === userId ? 'self' : 'other',
					userId: data.userId,
					text: data.message,
					timestamp: data.timestamp
				}
			];
		});

		// Handle receiving previous messages when joining a room
		socket.on('previousMessages', (previousMessages) => {
			console.log('Received previous messages:', previousMessages);
			// Map the server message format to our client format
			const formattedMessages = previousMessages.map((msg) => ({
				type: msg.userId === userId ? 'self' : 'other',
				userId: msg.userId,
				text: msg.message,
				timestamp: msg.timestamp
			}));
			messages = [...formattedMessages];
		});
	});

	onDestroy(() => {
		if (socket) {
			// Leave the room before disconnecting
			leaveRoom();
			socket.disconnect();
		}
	});

	function joinRoom() {
		if (socket && connected) {
			socket.emit('joinRoom', roomId);
			console.log(`Joined room: ${roomId}`);
		}
	}

	function createRoom() {
		if (socket && connected) {
			socket.emit('createRoom', roomId);
			console.log(`Created room: ${roomId}`);
		}
	}

	function leaveRoom() {
		if (socket && connected) {
			socket.emit('leaveRoom', roomId);
			console.log(`Left room: ${roomId}`);
		}
	}

	function sendMessage() {
		if (messageInput.trim() && socket && connected) {
			console.log(`Sending message: ${messageInput}`);
			socket.emit('sendMessage', { roomId, message: messageInput });
			messageInput = '';
		}
	}

	// Format timestamp for display
	function formatTime(timestamp) {
		if (!timestamp) return '';
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="room-container">
	<div class="room-header">
		<h1>Room: {roomId}</h1>
		<div class="connection-status">
			{#if connected}
				<span class="status connected">Connected ({userCount} users)</span>
			{:else}
				<span class="status disconnected">Disconnected</span>
			{/if}
		</div>
	</div>

	<div class="messages-container">
		{#if messages.length === 0}
			<p class="no-messages">No messages yet. Start the conversation!</p>
		{:else}
			{#each messages as message}
				<div class="message {message.type}">
					{#if message.type === 'system'}
						<div class="system-message">{message.text}</div>
					{:else if message.type === 'self'}
						<div class="self-message">
							<span class="message-text">{message.text}</span>
							<div class="message-meta">
								<span class="user-id">You</span>
								{#if message.timestamp}
									<span class="timestamp">{formatTime(message.timestamp)}</span>
								{/if}
							</div>
						</div>
					{:else}
						<div class="other-message">
							<span class="message-text">{message.text}</span>
							<div class="message-meta">
								<span class="user-id">{message.userId.substring(0, 6)}...</span>
								{#if message.timestamp}
									<span class="timestamp">{formatTime(message.timestamp)}</span>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>

	<div class="message-input">
		<input
			type="text"
			bind:value={messageInput}
			placeholder="Type a message..."
			on:keydown={(e) => e.key === 'Enter' && sendMessage()}
			disabled={!connected}
		/>
		<button on:click={sendMessage} disabled={!connected}>Send</button>
	</div>
</div>

<style>
	.room-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: 800px;
		margin: 0 auto;
		padding: 1rem;
	}

	.room-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.connection-status .status {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.status.connected {
		background-color: #4caf50;
		color: white;
	}

	.status.disconnected {
		background-color: #f44336;
		color: white;
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1rem;
		background-color: #f9f9f9;
		min-height: 300px;
	}

	.no-messages {
		color: #757575;
		text-align: center;
		margin-top: 2rem;
	}

	.message {
		margin-bottom: 0.5rem;
		max-width: 80%;
	}

	.system-message {
		text-align: center;
		color: #757575;
		font-style: italic;
		margin: 0.5rem 0;
		width: 100%;
	}

	.self-message {
		margin-left: auto;
		background-color: #e3f2fd;
		border-radius: 1rem 0 1rem 1rem;
		padding: 0.5rem 1rem;
		color: #0d47a1;
	}

	.other-message {
		margin-right: auto;
		background-color: #f5f5f5;
		border-radius: 0 1rem 1rem 1rem;
		padding: 0.5rem 1rem;
		color: #333;
	}

	.message-text {
		display: block;
		word-break: break-word;
	}

	.message-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		margin-top: 0.25rem;
		opacity: 0.8;
	}

	.user-id {
		font-weight: 600;
	}

	.timestamp {
		font-style: italic;
	}

	.message-input {
		display: flex;
		gap: 0.5rem;
	}

	input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
	}

	button {
		padding: 0.5rem 1rem;
		background-color: #2196f3;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:hover {
		background-color: #1976d2;
	}

	button:disabled {
		background-color: #bdbdbd;
		cursor: not-allowed;
	}
</style>
