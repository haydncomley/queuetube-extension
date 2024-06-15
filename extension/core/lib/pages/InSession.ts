import { component, computed, render, state, valueOf } from "../../../_nice";
import { Player } from "../components/Player";
import { Queue } from "../components/Queue";
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
        const count = (currentSession?.participants.length ?? 0) + 1;
        if (count == 1) return "1 person";
        return `${count} people`;
    }, [session]);

    const sessionId = computed(() => {
        return valueOf(session)?.id;
    }, [session]);

    const playingState = computed(() => {
        const state = valueOf(queue)?.playing?.state;

        if (state === 'playing') return '- Playing...';
        if (state === 'paused') return '- Paused.';
        return ''
    }, [queue]);

    const onAdd = computed(() => {
        const currentQueue = valueOf(queue);
        if (!currentQueue) return;

        const videoId = valueOf(window.location.href).match(/(?:\?v=|\/embed\/|\.be\/)([A-Za-z0-9_-]{11})/)?.[1];
        if (!videoId) return;

        const alreadyInQueue = currentQueue.list.find(q => q.id === videoId);
        if (alreadyInQueue) {
            alert('This video is already in the queue.');
            return;
        };

        queue.set({
            playing: currentQueue.playing || { index: 0 },
            list: [
                ...currentQueue.list,
                {
                    user: valueOf(name) as string,
                    id: videoId,
                    name: window.document.title.replace(' - YouTube', ''),
                }
            ],
        });
    });

    const onNext = computed(() => {
        const currentQueue = valueOf(queue);
        if (!currentQueue?.playing) return;

        const nextIndex = currentQueue.playing.index + 1;
        if (nextIndex >= currentQueue.list.length) return;

        queue.set({
            ...currentQueue,
            playing: {
                index: nextIndex
            }
        });
    });

    const onQuit = computed(() => {
        console.log('Leaving Session');
        session.set(undefined);
    });

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