export const API_URL = 'http://survey-backend.test/api/v1';

export const getAgencyReturnUrl = (
	status: 'filled' | 'qcout' | 'quota_full' | 'hard_screenout',
	id: string | null
) => {
	return `https://return-to.enp.world/respondent-research-status/research/45241/?status=${status}&id=${id ?? ''}`;
};
