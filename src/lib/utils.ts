import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getQuestionId = (slide: number, rowId: string | number, colId: number) => {
	return `sl-${slide}-row-${rowId}-col-${colId}`;
};
