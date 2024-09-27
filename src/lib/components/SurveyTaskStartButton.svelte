<script lang="ts">
	import userRepository from '$lib/database/repositories/user.repository';
	import { Button } from '$lib/shadcn/ui/button';
	import { gazeValidation } from '$lib/stores/gazeInput';
	import {
		surveyAllowValidations,
		surveyUserId,
		surveyIdentifier,
		surveyCurrentType
	} from '$lib/stores/surveyTask';
	import { v4 } from 'uuid';

	const handleStartSurvey = async () => {
		const uId = await userRepository.create({
			id: v4(),
			identifier: $surveyIdentifier,
			startedWith: $surveyCurrentType,
			resolution: {
				width: window.screen.width,
				height: window.screen.height,
				innerWidth: window.innerWidth,
				innerHeight: window.innerHeight
			},
			userAgent: navigator.userAgent,
			timestamp: Date.now()
		});

		surveyUserId.set(uId);

		if ($surveyAllowValidations) {
			gazeValidation.set(true);
		}
	};
</script>

<Button on:click={handleStartSurvey}>Spustit dotazník</Button>
