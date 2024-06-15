import { component, computed, render, state, valueOf } from "../../../_nice";
import { globalStore } from "../store";

import styles from './NoSession.module.css';

export const NoSession = component(() => {
    const session = globalStore('session');
    const queue = globalStore('queue');
    const sessionId = state('');

    const joinButtonLabel = computed(() => {
        return valueOf(sessionId).length ? 'Join Session' : 'Create Session';
    }, [sessionId]);

    const onChange = computed<Event>((e) => {
        const target = e.target as HTMLInputElement;
        sessionId.set(target.value);
    });

    const onJoin = computed(() => {
        if (!valueOf(sessionId)) sessionId.set(Math.random().toString(10).slice(-5))
        queue.set({ list: [] });
        session.set({ id: valueOf(sessionId), participants: [] });
    });

    return render`
    <div class=${styles.noSession}>
        <input on-input=${onChange} value=${sessionId} placeholder="Session Name" />
        <button on-click=${onJoin}>${joinButtonLabel}</button>
    </div>
    `;
});