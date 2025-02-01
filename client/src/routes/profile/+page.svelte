<script>
    import UserProfile from './user_profile.svelte';
    import userState from '../login/+page.svelte';

    const user = {
        username: userState.username
    };
</script>

<div>
    <UserProfile {user} />
</div>
