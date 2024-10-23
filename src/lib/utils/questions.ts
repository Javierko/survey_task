export const getQuestionId = (stage: number, slide: number, rowId: string | number, colId: number) => {
  return `st-${stage}-sl-${slide}-row-${rowId}-col-${colId}`;
};