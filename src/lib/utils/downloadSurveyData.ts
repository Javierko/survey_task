import type { AnswerReaction } from '$lib/database/models/Answer';
import answerRepository from '$lib/database/repositories/answer.repository';
import aoiRepository from '$lib/database/repositories/aoi.repository';
import clickRepository from '$lib/database/repositories/click.repository';
import userRepository from '$lib/database/repositories/user.repository';
import fileSaver from 'file-saver';
import JSZip from 'jszip';
import pointRepository from '$lib/database/repositories/point.repository';

export const downloadData = async (userIds: string[]): Promise<boolean> => {
  const output: Record<string, string[]> = {
    users: [userRepository.csvHeader()],
    clicks: [clickRepository.csvHeader()],
    aois: [aoiRepository.csvHeader()],
    answers: [answerRepository.csvReactionHeader()],
    et: [pointRepository.csvHeader()]
  };

  for (const id of userIds) {
    const user = await userRepository.read(id);

    if (!user) {
      console.error('User not found');

      return false;
    }

    output.users.push(await userRepository.toCsv(user));
    const clicks = await clickRepository.readMany(user.id);
    const aois = await aoiRepository.readMany(user.id);
    const answers = await answerRepository.readMany(user.id);
    const points = await pointRepository.readMany(user.id);

    if (!clicks || !aois || !answers || !points) {
      console.error('Data not found');

      return false;
    }

    const answersReaction: AnswerReaction[] = answers.map((answer, i, array) => ({
      ...answer,
      reaction:
        i === 0 || answer.timestamp == null || array[i - 1] == null || array[i - 1].timestamp == null
          ? 0
          : Math.abs((answer.timestamp - (array[i - 1]?.timestamp ?? 0)) / 1000)
    }));

    output.clicks.push(await clickRepository.toCsv(clicks));
    output.aois.push(await aoiRepository.toCsv(aois));
    output.answers.push(await answerRepository.toCsvReaction(
      answersReaction.filter((answer) => answer.questionId !== -1 && answer.answer !== -1)
    ));
    output.et.push(await pointRepository.toCsv(points));
  }

  const zip = new JSZip();

  zip.file('users.csv', output.users.join('\n'));
  zip.file('clicks.csv', output.clicks.join('\n'));
  zip.file('aois.csv', output.aois.join('\n'));
  zip.file('answers.csv', output.answers.join('\n'));
  zip.file('et.csv', output.et.join('\n'));

  const content = await zip.generateAsync({ type: 'blob' });
  fileSaver.saveAs(content, 'survey-output.zip');

  return true;
};
