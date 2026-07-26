export const DIFFICULTIES = {
  easy: { id: 'easy', label: 'Easy', size: 8, mines: 10 },
  medium: { id: 'medium', label: 'Medium', size: 10, mines: 15 },
  hard: { id: 'hard', label: 'Hard', size: 15, mines: 35 },
};

export const DIFFICULTY_LIST = Object.values(DIFFICULTIES);

export function getDifficulty(id) {
  return DIFFICULTIES[id] || null;
}
