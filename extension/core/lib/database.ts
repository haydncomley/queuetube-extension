import { getDatabase, set, ref, get, onValue } from "firebase/database";
import { Queue, Session, User } from "./store";

import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyDdL4TAF9Oo78mvcdy5wi21aSLR3pjZCPQ",
    authDomain: "queue-tube-extension.firebaseapp.com",
    projectId: "queue-tube-extension",
    storageBucket: "queue-tube-extension.appspot.com",
    messagingSenderId: "761499364188",
    appId: "1:761499364188:web:3b4903d8c46f103ac2ef99",
    databaseURL: "https://queue-tube-extension-default-rtdb.europe-west1.firebasedatabase.app/"
};

export const firebaseApp = initializeApp(firebaseConfig);

const db = getDatabase();

export const dbCreateOrJoinSession = async (sessionId: string, user: User) => {
    console.log('Create or join');
    const sessionRef = ref(db, `sessions/${sessionId}/session`);
    const sessionSnapshot = await get(sessionRef);

    let session: Session = {
        id: sessionId,
        participants: [],
    };

    if (sessionSnapshot.exists()) {
        console.log('Session exists', sessionSnapshot.val());
        session = {
            ...session,
            ...sessionSnapshot.val()
        };
        
        const uniqueUsers = new Set(session.participants.map(p => p.name));
        if (!uniqueUsers.has(user.name)) session.participants.push(user);
        set(sessionRef, session);
    } else {
        console.log('Session does not exist');
        session.participants.push(user);
        await set(sessionRef,  session);
    }
    
    console.log('Session details', session);
    return session;
}

export const dbLeaveSession = async (sessionId: string, user: User) => {
    const sessionRef = ref(db, `sessions/${sessionId}/session`);
    const sessionSnapshot = await get(sessionRef);
    const session = sessionSnapshot.val();
    session.participants = session.participants.filter(p => p.name !== user.name);
    
    await set(sessionRef, session.participants.length ? session : null);
}

export const dbUpdateQueue = async (sessionId: string, queue: Queue) => {
    const queueRef = ref(db, `sessions/${sessionId}/queue`);
    await set(queueRef, queue);
    const queueSnapshot = await get(queueRef);
    return queueSnapshot.val() as Promise<Queue>;
}

export const dbGetQueue = async (sessionId: string) => {
    const queueRef = ref(db, `sessions/${sessionId}/queue`);
    const queueSnapshot = await get(queueRef);
    return queueSnapshot.val() as Promise<Queue>;
}

export const dbListenToQueue = (sessionId: string, callback: (queue: Queue) => void) => {
    const queueRef = ref(db, `sessions/${sessionId}/queue`);
    return onValue(queueRef, (snapshot) => {
        callback(snapshot.val() as Queue);
    });
}

export const dbListenToSession = (sessionId: string, callback: (session: Session) => void) => {
    const sessionRef = ref(db, `sessions/${sessionId}/session`);
    return onValue(sessionRef, (snapshot) => {
        callback(snapshot.val() as Session);
    });
};