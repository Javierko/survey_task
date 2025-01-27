import type { ApiResponse } from "@/models/ApiResponse";

export const get = async <T>(url: string): Promise<ApiResponse<T>> => {
    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json());
};

export const post = async <T>(url: string, data: T): Promise<ApiResponse<T>> => {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(response => response.json());
};