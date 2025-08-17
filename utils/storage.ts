import { PersistedState } from './types';

const STORAGE_KEY = 'quantumBondState';

export const loadState = (): PersistedState | undefined => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load state from local storage", err);
    return undefined;
  }
};

export const saveState = (state: PersistedState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error("Could not save state to local storage", err);
  }
};

export const clearState = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
        console.error("Could not clear state from local storage", err);
    }
}
