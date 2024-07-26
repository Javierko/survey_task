export const getQuestionId = (slide: number, rowId: string | number, colId: number) => {
  return `sl-${slide}-row-${rowId}-col-${colId}`;
};