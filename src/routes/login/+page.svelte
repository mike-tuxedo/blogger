<script>
    import { goto } from "$app/navigation";
    import { user } from "$lib/store.js";
    import { onMount } from "svelte";

    const login = () => {
        $user = "Mike";
        goto("/");
    };

    onMount(() => {
        document.body.classList.add('login');
        document.body.classList.remove('post');
    })
</script>

<div
    class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
>
    <span
        class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
    >
        <img class="w-8 h-8 mr-2" src="/logo.svg" alt="logo" />
        BlogYourMind
</span>
    <div
        class="w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 bg-white/60 backdrop-blur-sm"
    >
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1
                class="text-xl font-bold leading-tight tracking-tight md:text-2xl"
            >
                Create admin account/ Sign in to your account
            </h1>
            <form class="space-y-4 md:space-y-6" action="#">
                <div>
                    <label
                        for="email"
                        class="block mb-2 text-sm font-medium"
                        >Your email</label
                    >
                    <input
                        type="email"
                        name="email"
                        id="email"
                        class="input input-bordered w-full"
                        placeholder="name@company.com"
                        required=""
                    />
                </div>
                <div>
                    <label
                        for="password"
                        class="block mb-2 text-sm font-medium"
                        >Password</label
                    >
                    <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="••••••••"
                        class="input input-bordered w-full"
                        required=""
                    />
                </div>
                <button
                    type="submit"
                    on:click={login}
                    class="w-full btn btn-primary">Sign in</button
                >
            </form>
        </div>
    </div>
</div>

<style lang="scss">
</style>
