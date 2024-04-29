<script>
    import { goto } from "$app/navigation";
    import { user } from "$lib/store.js";

    const login = () => {
        $user = 'Mike';
        goto('/');
    }
</script>

<div class="content">
    <input type="text" name="user">
    <input type="password" name="password">
    <button on:click={login}>Login</button>
</div>

<style lang="scss">
    .content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
</style>