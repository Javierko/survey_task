import type { Fixation } from '$lib/database/models/Fixation';
import fixationRepository from '$lib/database/repositories/fixation.repository';
import { surveyUserId } from '$lib/stores/surveyTask';
import type { GazeInteractionObjectFixationEvent } from 'develex-js-sdk';
import { get } from 'svelte/store';

export const addFixationEvent = (event: GazeInteractionObjectFixationEvent) => {
	const { type, timestamp, duration, x, y, target, fixationId } = event;

	const aois = Array.isArray(target) ? target.map((t) => t.id.toString()).join(';') : '';

	const fixation: Fixation = {
		userId: get(surveyUserId) as string,
		fixationId,
		aois,
		duration,
		x,
		y,
		type,
		timestamp
	};

	fixationRepository.create(fixation);
};
