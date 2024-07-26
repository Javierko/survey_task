import { writable } from 'svelte/store';

export const surveySlide = writable(0);
export const surveyUserId = writable<string | null>(null);
export const surveyFinished = writable(false);
export const surveyQuestion = writable(new Set([0]));