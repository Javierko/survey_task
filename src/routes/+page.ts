import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const id = url.searchParams.get('id') || null;

	return { id };
};
