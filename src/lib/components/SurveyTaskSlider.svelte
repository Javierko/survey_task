<script lang="ts">
import QUESTIONS from "$lib/data/questions.json";
import { surveySlide } from "$lib/stores/surveyTask";
import SurveyTaskQuestions from "./SurveyTaskQuestions.svelte";

const headers = [
	"Naprosto souhlasím",
	"Souhlasím",
	"Spíše souhlasím",
	"Nevím",
	"Spíše nesouhlasím",
	"Nesouhlasím",
	"Naprosto nesouhlasím",
];

$: questions = QUESTIONS[$surveySlide];
</script>

<SurveyTaskQuestions {questions} {headers} />
