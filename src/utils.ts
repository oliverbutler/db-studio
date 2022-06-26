import { onCleanup } from 'solid-js';

export const lastElementMatching = <T>(
  arr: T[],
  predicate: (x: T) => boolean
): T | undefined => {
  return [...arr].reverse().find(predicate);
};

export const addEventListener = (
  event: string,
  callback: (...args: any[]) => void
): void => {
  document.addEventListener(event, callback);

  onCleanup(() => {
    document.removeEventListener(event, callback);
  });
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
