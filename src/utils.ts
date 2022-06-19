export const lastElementMatching = <T>(
  arr: T[],
  predicate: (x: T) => boolean
): T | undefined => {
  return [...arr].reverse().find(predicate);
};
