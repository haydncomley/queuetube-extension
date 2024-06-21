import { component, computed, render, state, valueOf } from "../../../_nice";
import { Player } from "../components/Player";
import { Queue } from "../components/Queue";
import { dbLeaveSession, dbListenToQueue, dbListenToSession, dbUpdateQueue } from "../database";
import { globalStore } from "../store";

import styles from './InSession.module.css';

export const InSession = component(() => {
    const user = globalStore('user');
    const session = globalStore('session');
    const queue = globalStore('queue');

    const name = computed(() => {
        return valueOf(user)?.name;
    }, [user]);

    const userCount = computed(() => {
        const currentSession = valueOf(session);
        const count = (Object.keys(currentSession?.participants ?? {}).length ?? 1);
        if (count == 1) return "1 person";
        return `${count} people`;
    }, [session]);

    const sessionId = computed(() => {
        return valueOf(session)?.id ?? '';
    }, [session]);

    computed(() => {
        const currentSessionId = valueOf(session)?.id;
        if (!currentSessionId) return;
        const unsubSession = dbListenToSession(currentSessionId, valueOf(name), (newSession) => {
            const oldParticipants = Object.keys(valueOf(session)?.participants ?? {}).length;
            const newParticipants = Object.keys(newSession.participants).length;
            if (oldParticipants && newParticipants && oldParticipants !== newParticipants) {
                session.set(newSession);
            }
        });
        return () => {
            unsubSession();
        }
    }, [session]);

    const playingState = computed(() => {
        const state = valueOf(queue)?.playing?.state;
        const lastUser = valueOf(queue)?.playing?.lastUser?.name;
        const prefix = lastUser ? `${lastUser} ` : '';

        if (state === 'playing') return `- ${prefix}Playing...`;
        if (state === 'paused') return `- ${prefix}Paused.`;
        return ''
    }, [queue]);

    const onAdd = computed(async () => {
        const currentQueue = valueOf(queue);
        const sessionId = valueOf(session)?.id;
        if (!sessionId) return;

        const videoId = valueOf(window.location.href).match(/(?:\?v=|\/embed\/|\.be\/)([A-Za-z0-9_-]{11})/)?.[1];
        if (!videoId) return;

        const alreadyInQueue = (currentQueue?.list ?? []).find(q => q.id === videoId);
        if (alreadyInQueue) {
            alert('This video is already in the queue.');
            return;
        };

        const newQueue = {
            playing: currentQueue?.playing || { index: 0 },
            list: [
                ...(currentQueue?.list ?? []),
                {
                    user: valueOf(name) as string,
                    id: videoId,
                    name: window.document.title.replace(' - YouTube', ''),
                }
            ],
        };

        queue.set(await dbUpdateQueue(sessionId, newQueue));
    });

    const onQuit = computed(() => {
        const currentSession = valueOf(session);
        const currentUser = valueOf(user);
        if (currentSession && currentUser) dbLeaveSession(currentSession?.id, currentUser);
        session.set(undefined);
    });

    computed(() => {
        const currentSession = valueOf(session);
        if (!currentSession) return;

        const unsubQueue = dbListenToQueue(currentSession.id, (newQueue) => {
            if (newQueue && newQueue.playing?.lastUser?.name !== valueOf(name)) {
                queue.set(newQueue);
            };
        });

        return () => {
            unsubQueue();
        }
    }, [session]);

    return render`
    <div class=${styles.inSession}>
        <div class=${styles.inSessionHeader}>
            <h1>Session: ${sessionId}</h1>
            <p><small>- ${userCount}</small></p>
            <p><small>${playingState}</small></p>
        </div>

        <div class=${styles.inSessionContent}>
            <aside class=${styles.inSessionSide}>
                ${Queue()}

                <div class=${styles.inSessionSideActions}>
                    <button on-click=${onAdd}>Add to Queue</button>
                    <button on-click=${onQuit}>Leave</button>
                </div>
            </aside>
            <aside class=${styles.inSessionSide}>
                ${Player()}
            </aside>
        </div>
    </div>
    `;
});