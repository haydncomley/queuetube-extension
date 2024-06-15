import { store } from "../../_nice";

export interface User {
    name: string;
}

export interface QueueRequest {
    id: string;
    name: string;
    user: string;
}

export interface QueuePlaying {
    index: number;
    state?: 'playing' | 'paused';
    seek?: number;
    lastUser?: User;
}

export interface Session {
    id: string;
    participants: User[];
}

export interface Queue {
    list: QueueRequest[];
    playing?: QueuePlaying;
}

export const globalStore = store<{
    user?: User;
    session?: Session;
    queue?: Queue;
}>({
    user: undefined,
    session: undefined,
    queue: undefined,
});