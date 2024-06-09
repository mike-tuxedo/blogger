import { writable, get } from 'svelte/store';

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

export const baseurl = writable(null);

export const usePhpApi = writable(true);

export const postsView = writable('grid'); // grid or table
useLocalStorage(postsView, 'postsView');
