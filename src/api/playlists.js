import { db } from '../firebase';
import { doc, collection, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export async function createPlaylist(uid, name) {
  const ref = doc(collection(db, `users/${uid}/playlists`));
  await setDoc(ref, { name, tracks: [], createdAt: Date.now() });
  return ref.id;
}

export async function addToPlaylist(uid, playlistId, track) {
  const ref = doc(db, `users/${uid}/playlists/${playlistId}`);
  await updateDoc(ref, { tracks: arrayUnion(track) });
}

export async function likeTrack(uid, track) {
  const ref = doc(db, `users/${uid}/likedSongs/${track.videoId}`);
  await setDoc(ref, { ...track, likedAt: Date.now() });
}

export async function addToHistory(uid, track) {
  const ref = doc(collection(db, `users/${uid}/history`));
  await setDoc(ref, { 
    videoId: track.videoId, 
    title: track.title, 
    artist: track.artist,
    thumbnail: track.thumbnail,
    playedAt: Date.now() 
  });
}
