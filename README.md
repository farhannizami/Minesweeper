# Minesweeper

Classical Minesweeper with a Firebase-backed leaderboard.

## Development

Requires Node.js 20.19+ or 22.12+ for Vite 8.

1. Copy `.env.example` to `.env` and fill in the Firebase web app values.
2. Enable Firebase Anonymous Authentication.
3. Deploy `firestore.rules` and `firestore.indexes.json`, or run the emulators locally.
4. Install dependencies and start the app:

```bash
npm install
npm run dev
```

To use local Firebase emulators, set `VITE_USE_FIREBASE_EMULATORS=true` in `.env` and run:

```bash
npm run emulators
```

## Firebase Security

Leaderboard entries are stored in the Firestore `leaderboard` collection. Client writes require anonymous auth and are create-only. Rules validate the exact document shape and reject updates/deletes.

For production, restrict the Firebase API key by HTTP referrer in Google Cloud and enable Firebase App Check enforcement after monitoring legitimate traffic.