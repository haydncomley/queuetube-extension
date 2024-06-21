import { component, computed, render, state, valueOf } from "../../../_nice";
import { dbCreateOrJoinSession, dbGetQueue } from "../database";
import { globalStore } from "../store";

import styles from './NoSession.module.css';

export const NoSession = component(() => {
    const session = globalStore('session');
    const queue = globalStore('queue');
    const user = globalStore('user');
    const sessionId = state('');
    const isLoading = state(false);

    const joinButtonLabel = computed(() => {
        return valueOf(sessionId).length ? 'Join Session' : 'Create Session';
    }, [sessionId]);

    const onChange = computed<Event>((e) => {
        const target = e.target as HTMLInputElement;
        sessionId.set(target.value);
    });

    const onJoin = computed(async () => {
        const currentUser = valueOf(user);
        if (!currentUser) return;
        if (!valueOf(sessionId)) sessionId.set(Math.random().toString(10).slice(-5))
        isLoading.set(true);

        const sessionDetails = await dbCreateOrJoinSession(valueOf(sessionId), currentUser);
        const queueDetails = await dbGetQueue(sessionDetails.id);
    
        isLoading.set(false);

        queue.set(queueDetails);
        session.set(sessionDetails);
    });

    const onQuit = computed(() => {
        user.set(undefined);
    });

    return render`
    <div class=${styles.noSession}>
        <input on-input=${onChange} value=${sessionId} placeholder="Session Name" />
        
        <div class=${styles.noSessionActions}>
            <button on-click=${onQuit}>Change Name</button>
            <button on-click=${onJoin}>${joinButtonLabel}</button>
        </div>
    </div>
    `;
});