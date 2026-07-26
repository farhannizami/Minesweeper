import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db, ensureAnonymousAuth } from './firebase.js';

const LEADERBOARD_LIMIT = 25;

export async function submitScore({ playerName, timeSeconds, difficulty }) {
  const user = await ensureAnonymousAuth();
  await addDoc(collection(db, 'leaderboard'), {
    playerName,
    timeSeconds,
    difficulty: difficulty.id,
    createdAt: serverTimestamp(),
    uid: user.uid,
  });
}

export async function loadLeaderboard(difficulty) {
  const scoresQuery = query(
    collection(db, 'leaderboard'),
    where('difficulty', '==', difficulty.id),
    orderBy('timeSeconds', 'asc'),
    orderBy('createdAt', 'asc'),
    limit(LEADERBOARD_LIMIT),
  );
  const snapshot = await getDocs(scoresQuery);
  return snapshot.docs.map((doc) => doc.data());
}
