import { writable } from 'svelte/store';
import { PUBLIC_USE_PHP, PUBLIC_API_URL } from '$env/static/public';

const useLocalStorage = (store, key) => {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const json = localStorage.getItem(key);
        if (json) {
            store.set(JSON.parse(json));
        }
        const unsubscribe = store.subscribe(current => {
            localStorage.setItem(key, JSON.stringify(current));
        });
    }
}

export const user = writable(null);
useLocalStorage(user, 'user');

export const baseurl = writable(PUBLIC_API_URL);

export const usePhpApi = writable(PUBLIC_USE_PHP === '1');

export const postsView = writable('grid'); // grid or table
useLocalStorage(postsView, 'postsView');
