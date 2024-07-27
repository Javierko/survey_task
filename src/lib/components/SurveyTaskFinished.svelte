<script lang="ts">
import { surveyUserId } from "$lib/stores/surveyTask";
import { downloadData } from "$lib/utils/downloadSurveyData";
import { Button } from "$lib/shadcn/ui/button";
import Icon from "@iconify/svelte";

const download = async () => {
	await downloadData([$surveyUserId as string]);
};
</script>

<div
	class="flex flex-col items-center w-full h-full m-auto gap-4 shadow bg-white rounded-md max-w-4xl p-4 border border-gray-100"
>
	<div class="flex items-center w-full bg-green-50 border border-green-600 rounded-md p-4 gap-4">
    <Icon icon="lucide:badge-check" class="w-6 h-6 text-green-600 flex-shrink-0" />

		<p class="text-gray-700">Dotazník byl úspěšně vyřešen, nezapomeňte si stáhnout data.</p>
	</div>

  <Button on:click={download}>
    Stáhnout data
  </Button>
</div>
