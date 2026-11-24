import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { signInWithPopup, signOut } from 'firebase/auth';
import {
  auth,
  db,
  googleAuthProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { FootballMatchPredictionResult, PhotoScanResult } from '../types';

export interface FirestorePhotoScanDoc {
  id: string;
  ownerId: string;
  platform: string;
  activeRow: number;
  recommendedColumn: number;
  overallConfidence: number;
  summaryTitle: string;
  answerExplanation: string;
  safeColumns: number[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FirestoreSignalDoc {
  id: string;
  ownerId: string;
  platform: 'sokrizybet' | '1xbet';
  accountId: string;
  gameId: string;
  strategy: string;
  accuracy: number;
  safeColumns: number[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FirestoreCloudflareConfigDoc {
  id: string;
  ownerId: string;
  projectName: string;
  workerName: string;
  customDomain: string;
  wafLevel: 'high' | 'under_attack' | 'medium';
  edgeCacheTtl: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FirestoreFootballPredictionDoc {
  id: string;
  ownerId: string;
  league: string;
  matchTitle: string;
  homeTeam: string;
  awayTeam: string;
  winningTeamPick: string;
  handicapPick: string;
  overUnderPick: string;
  correctScorePick: string;
  topLockPick?: string;
  bttsPick?: string;
  htFtPick?: string;
  cornersPick?: string;
  cardsPick?: string;
  confidence: number;
  workingSummary: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export async function signInWithGooglePopup() {
  return await signInWithPopup(auth, googleAuthProvider);
}

export async function signOutFirebaseUser() {
  await signOut(auth);
}

export async function syncUserProfileToFirestore(params: {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  bettingPlatform?: 'sokrizybet' | '1xbet';
  bettingAccountId?: string;
  bio?: string;
}) {
  const publicPath = `users/${params.uid}`;
  const privatePath = `users/${params.uid}/private/info`;
  const cleanName = (params.displayName || params.email || 'Player').slice(0, 80);
  const platform = params.bettingPlatform === '1xbet' ? '1xbet' : 'sokrizybet';

  try {
    const publicRef = doc(db, 'users', params.uid);
    const existingPublic = await getDoc(publicRef);
    if (!existingPublic.exists()) {
      await setDoc(publicRef, {
        uid: params.uid,
        displayName: cleanName,
        bettingPlatform: platform,
        vipTier: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(publicRef, {
        displayName: cleanName,
        bettingPlatform: platform,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, publicPath);
  }

  try {
    const privateRef = doc(db, 'users', params.uid, 'private', 'info');
    const existingPrivate = await getDoc(privateRef);
    if (!existingPrivate.exists()) {
      await setDoc(privateRef, {
        uid: params.uid,
        email: params.email.slice(0, 160),
        phone: (params.phone || '').slice(0, 30),
        bettingAccountId: (params.bettingAccountId || '').slice(0, 64),
        bio: (params.bio || '').slice(0, 280),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(privateRef, {
        email: params.email.slice(0, 160),
        phone: (params.phone || '').slice(0, 30),
        bettingAccountId: (params.bettingAccountId || '').slice(0, 64),
        bio: (params.bio || '').slice(0, 280),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, privatePath);
  }
}

export function subscribeToUserPhotoScans(
  uid: string,
  onData: (items: FirestorePhotoScanDoc[]) => void
) {
  const path = 'photoScans';
  const q = query(
    collection(db, path),
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FirestorePhotoScanDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FirestorePhotoScanDoc, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function savePhotoScanToFirestore(uid: string, scan: PhotoScanResult) {
  const safeId = `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.replace(/[^a-zA-Z0-9_-]/g, '');
  const docPath = `photoScans/${safeId}`;
  const safeColumns = scan.rowSignals
    .slice(0, 10)
    .map((r) => Math.max(1, Math.min(5, Math.round(r.bestColumn || scan.recommendedColumn || 1))));

  try {
    await setDoc(doc(db, 'photoScans', safeId), {
      ownerId: uid,
      platform: (scan.detectedPlatform || 'SokRizyBet').slice(0, 60),
      activeRow: Math.max(1, Math.min(10, Math.round(scan.detectedActiveRow || 1))),
      recommendedColumn: Math.max(1, Math.min(5, Math.round(scan.recommendedColumn || 1))),
      overallConfidence: Number(scan.overallConfidence || 99.99),
      summaryTitle: (scan.summaryTitle || 'AI Answer Signal').slice(0, 140),
      answerExplanation: (scan.answerExplanation || '').slice(0, 1000),
      safeColumns: safeColumns.length > 0 ? safeColumns : [1],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return safeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function deletePhotoScanFromFirestore(scanId: string) {
  const docPath = `photoScans/${scanId}`;
  try {
    await deleteDoc(doc(db, 'photoScans', scanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function subscribeToUserSignals(
  uid: string,
  onData: (items: FirestoreSignalDoc[]) => void
) {
  const path = 'signals';
  const q = query(
    collection(db, path),
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FirestoreSignalDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FirestoreSignalDoc, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveSignalToFirestore(
  uid: string,
  payload: {
    platform: 'sokrizybet' | '1xbet';
    accountId: string;
    gameId: string;
    strategy: string;
    accuracy: number;
    safeColumns: number[];
  }
) {
  const safeId = `sig_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.replace(/[^a-zA-Z0-9_-]/g, '');
  const docPath = `signals/${safeId}`;

  try {
    await setDoc(doc(db, 'signals', safeId), {
      ownerId: uid,
      platform: payload.platform,
      accountId: (payload.accountId || 'SRB-ACCOUNT').slice(0, 64),
      gameId: (payload.gameId || 'AOF-LIVE').slice(0, 64),
      strategy: (payload.strategy || 'power_max').slice(0, 40),
      accuracy: Number(payload.accuracy || 99.99),
      safeColumns: payload.safeColumns.slice(0, 10),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return safeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export function subscribeToCloudflareConfigs(
  uid: string,
  onData: (items: FirestoreCloudflareConfigDoc[]) => void
) {
  const path = 'cloudflareConfigs';
  const q = query(
    collection(db, path),
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(15)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FirestoreCloudflareConfigDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FirestoreCloudflareConfigDoc, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveCloudflareConfigToFirestore(
  uid: string,
  config: {
    projectName: string;
    workerName: string;
    customDomain: string;
    wafLevel: 'high' | 'under_attack' | 'medium';
    edgeCacheTtl: number;
  }
) {
  const safeId = `cf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.replace(/[^a-zA-Z0-9_-]/g, '');
  const docPath = `cloudflareConfigs/${safeId}`;

  try {
    await setDoc(doc(db, 'cloudflareConfigs', safeId), {
      ownerId: uid,
      projectName: config.projectName.slice(0, 80),
      workerName: config.workerName.slice(0, 80),
      customDomain: config.customDomain.slice(0, 120),
      wafLevel: config.wafLevel,
      edgeCacheTtl: Math.max(0, Math.min(86400, Math.round(config.edgeCacheTtl))),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return safeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export function subscribeToUserFootballPredictions(
  uid: string,
  onData: (items: FirestoreFootballPredictionDoc[]) => void
) {
  const path = 'footballPredictions';
  const q = query(
    collection(db, path),
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: FirestoreFootballPredictionDoc[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<FirestoreFootballPredictionDoc, 'id'>),
      }));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveFootballPredictionToFirestore(
  uid: string,
  prediction: FootballMatchPredictionResult
) {
  const safeId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`.replace(/[^a-zA-Z0-9_-]/g, '');
  const docPath = `footballPredictions/${safeId}`;
  const home = (prediction.homeTeam || 'Home Team').slice(0, 80);
  const away = (prediction.awayTeam || 'Away Team').slice(0, 80);

  try {
    const topLock = prediction.topLockPick
      ? `${prediction.topLockPick.market}: ${prediction.topLockPick.selection}`.slice(0, 140)
      : (prediction.winningTeam.pick || home).slice(0, 140);

    await setDoc(doc(db, 'footballPredictions', safeId), {
      ownerId: uid,
      league: (prediction.league || 'International').slice(0, 80),
      matchTitle: `${home} vs ${away}`.slice(0, 160),
      homeTeam: home,
      awayTeam: away,
      winningTeamPick: (prediction.winningTeam.pick || home).slice(0, 100),
      handicapPick: (prediction.asianHandicap.pickLabel || '0').slice(0, 100),
      overUnderPick: (prediction.overUnder.pickLabel || 'Over 2.5').slice(0, 100),
      correctScorePick: (prediction.correctScore.primaryScore || '2 - 1').slice(0, 32),
      topLockPick: topLock,
      bttsPick: (prediction.btts?.pickLabel || `BTTS ${prediction.btts?.pick || 'YES'}`).slice(0, 60),
      htFtPick: (prediction.halfTimeFullTime?.primaryCombo || 'Home / Home').slice(0, 60),
      cornersPick: (prediction.corners?.pickLabel || 'Over 9.5 Corners').slice(0, 60),
      cardsPick: (prediction.cards?.pickLabel || 'Over 3.5 Cards').slice(0, 60),
      confidence: Math.max(0, Math.min(100, Number(prediction.overallConfidence || 99.99))),
      workingSummary: (prediction.workingSummary || '').slice(0, 1000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return safeId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function deleteFootballPredictionFromFirestore(predictionId: string) {
  const docPath = `footballPredictions/${predictionId}`;
  try {
    await deleteDoc(doc(db, 'footballPredictions', predictionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
