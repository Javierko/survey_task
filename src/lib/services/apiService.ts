import { PUBLIC_API_URL } from '$env/static/public';
import type { ApiResponse } from '@/models/ApiResponse';

export const apiGet = async <T>(
	url: string,
	token: string | null = null
): Promise<ApiResponse<T>> => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	};

	if (token != null) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	return fetch(`${PUBLIC_API_URL}/${url}`, {
		method: 'GET',
		headers: headers,
		credentials: 'include'
	}).then((response) => response.json());
};

export const apiPost = async <T>(
	url: string,
	data: unknown,
	token: string | null = null
): Promise<ApiResponse<T>> => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	};

	if (token != null) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	return fetch(`${PUBLIC_API_URL}/${url}`, {
		method: 'POST',
		headers: headers,
		body: JSON.stringify(data),
		credentials: 'include'
	}).then((response) => response.json());
};
