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
}

export const globalStore = store<{
    user?: User;
    session?: {
        id: string;
        participants: User[];
    };
    queue?: {
        playing?: QueuePlaying;
        list: QueueRequest[]
    }
}>({
    user: undefined,
    session: undefined,
    queue: undefined,
});