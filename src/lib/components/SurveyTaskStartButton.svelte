<script lang="ts">
import userRepository from "$lib/database/repositories/user.repository";
import { Button } from "$lib/shadcn/ui/button";
import { surveyUserId } from "$lib/stores/surveyTask";
import { v4 } from "uuid";

const handleStartSurvey = async () => {
	const uId = await userRepository.create({
		id: v4(),
		resolution: {
			width: window.screen.width,
			height: window.screen.height,
		},
		userAgent: navigator.userAgent,
		timestamp: Date.now(),
	});

	surveyUserId.set(uId);
};
</script>

<Button on:click={handleStartSurvey}>
  Spustit dotazník
</Button>