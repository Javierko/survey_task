import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getQuestionId = (stage: number, slide: number, rowId: string | number, colId: number) => {
	return `st-${stage}-sl-${slide}-row-${rowId}-col-${colId}`;
  };
  