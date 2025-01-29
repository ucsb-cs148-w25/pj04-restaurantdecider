<script>
    import UserProfile from './user_profile.svelte';

    const user = {
        username: 'user123',
    };
</script>

<div>
    <UserProfile {user} />
</div>
