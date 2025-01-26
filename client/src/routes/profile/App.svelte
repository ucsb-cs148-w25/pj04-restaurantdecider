<script>
    import UserProfile from './user_profile.svelte';

    const user = {
        email: 'user@example.com',
        dietaryRestrictions: []
    };
</script>

<div>
    <UserProfile {user} />
</div>
