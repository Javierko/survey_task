import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import words from '$lib/data/iat/words.json';
import { toast } from 'svelte-sonner';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getQuestionId = (slide: number, rowId: string | number, colId: number) => {
	return `sl-${slide}-row-${rowId}-col-${colId}`;
};

export const shuffleArray = <T>(array: T[]): T[] => {
	const shuffled = [...array];

	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	return shuffled;
};

export type Category = 'bad' | 'good';
export type IatPictureCategory = 'black' | 'white';
export type Key = 'e' | 'i';

export const takeWords = (
	amount: number,
	category: Category,
	shuffle: boolean = true
): string[] => {
	let wordsList = words[category];

	if (shuffle) {
		wordsList = shuffleArray(wordsList);
	}

	return wordsList.slice(0, amount);
};

const iatPictures = [
	'bf14_nc.jpg',
	'bf23_nc.jpg',
	'bf56_nc.jpg',
	'bm14_nc.jpg',
	'bm23_nc.jpg',
	'bm56_nc.jpg',
	'wf2_nc.jpg',
	'wf3_nc.jpg',
	'wf6_nc.jpg',
	'wm1_nc.jpg',
	'wm4_nc.jpg',
	'wm6_nc.jpg'
];

export const takeIatPictures = (
	pictureCategory: IatPictureCategory,
	amount: number = 6,
	shuffle: boolean = true
): string[] => {
	let pictures = iatPictures.filter((pic) =>
		pic.startsWith(pictureCategory === 'black' ? 'b' : 'w')
	);

	if (shuffle) {
		pictures = shuffleArray(pictures);
	}

	if (amount > pictures.length) {
		pictures = shuffleArray(takeFromArray(pictures, amount));
	}

	return pictures;
};

export const takeFromArray = <T>(arr: T[], take: number): T[] => {
	if (arr.length === 0 || take <= 0) return [];

	const result: T[] = [];
	let i = 0;

	while (result.length < take) {
		result.push(arr[i % arr.length]);
		i++;
	}

	return result;
};

export const errorToast = (message: string, description: string) => {
	toast.error(message, {
		description: description
	});
};
