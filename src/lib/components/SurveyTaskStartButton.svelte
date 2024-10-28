<script lang="ts">
	import userRepository from '$lib/database/repositories/user.repository';
	import { Button } from '$lib/shadcn/ui/button';
	import { gazeValidation } from '$lib/stores/gazeInput';
	import {
		surveyAllowValidations,
		surveyUserId,
		surveyCurrentType,
		switchCurrentType,
		surveyUserData,
		surveyState,
		SurveyState
	} from '$lib/stores/surveyTask';
	import { v4 } from 'uuid';

	const handleStartSurvey = async () => {
		const lastUser = await userRepository.getLastUser();

		if (lastUser) {
			surveyCurrentType.set(lastUser.startedWith);
			switchCurrentType();
		}

		const uId = await userRepository.create({
			id: v4(),
			identifier: $surveyUserData.identifier,
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
		surveyState.set(SurveyState.FirstPhase);

		if ($surveyAllowValidations) {
			gazeValidation.set(true);
		}
	};
</script>

<Button on:click={handleStartSurvey}>Spustit dotazník</Button>
