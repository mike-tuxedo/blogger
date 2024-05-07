<script>
    import { goto } from "$app/navigation";
    import { user } from "$lib/store.js";

    const login = () => {
        $user = 'Mike';
        goto('/posts');
    }
</script>

<div class="content">
    <input type="text" name="user" class="mb-1">
    <input type="password" name="password">
    <button class="btn btn-primary mt-2" on:click={login}>Login</button>
</div>

<style lang="scss">
    .content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;

        button {
            background-color: $primary;
            color: white;
            padding: 5px 10px;
            border-radius: 3px;
            border: none;
            cursor: pointer;
    
            &:hover {
                background-color: $secondary;
            }
        }
    }
</style>