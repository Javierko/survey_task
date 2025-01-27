export const saveToLocalStorage = (key: string, value: unknown, ttl: number): void => {
    const now = Date.now();

    const item = {
        value,
        expiry: now + ttl
    };

    localStorage.setItem(key, JSON.stringify(item));
};

export const getFromLocalStorage = <T>(key: string): T | null => {
    const itemStr = localStorage.getItem(key);

    if (!itemStr) {
        return null;
    }

    const item = JSON.parse(itemStr);

    if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
    }

    return item.value;
};
