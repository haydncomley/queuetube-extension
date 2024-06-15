import { component, computed, render, valueOf, Prop } from "../../../_nice";
import { globalStore } from "../store";
import { QueueRequest } from "../../lib/store";

import styles from './QueueItem.module.css';

const MAX_NAME_LENGTH = 35;

export const QueueItem = component<{
    details?: Prop<QueueRequest> 
}>(({ details }) => {
    const queue = globalStore('queue');

    const name = computed(() => {
        if (!details) return 'Queue Empty';
        let videoName = valueOf(details).name;
        if (videoName.length > MAX_NAME_LENGTH) videoName = videoName.slice(0, MAX_NAME_LENGTH) + '...';
        return videoName;
    }, [details])

    const videoIndex = computed(() => {
        if (!details) return -1;
        return valueOf(queue)?.list.findIndex((x) => x.id === valueOf(details)?.id) || 0;
    }, [queue, details]);

    const videoId = computed(() => {
        return valueOf(details)?.id;
    }, [details]);

    const userName = computed(() => {
        if (!details) return 'Click "Add to Queue" to get started.';
        return valueOf(details).user;
    }, [details])

    const queueItemClasses = computed(() => {
        const index = valueOf(videoIndex);
        const classes: string[] = [styles.queueItem];

        if (index !== -1) {
            const isPlaying = valueOf(queue)?.playing?.index === index;
            const isPast = index < (valueOf(queue)?.playing?.index || -1);
    
            if (isPlaying) classes.push(styles.playing);
            if (isPast) classes.push(styles.done);
        } else {
            classes.push(styles.empty);
        }

        return classes.join(' ');
    }, [queue, videoIndex]);

    const onClick = computed(() => {
        queue.set({
            list: valueOf(queue)?.list || [],
            playing: {
                index: valueOf(videoIndex)
            }
        });
    });

    return render`
    <li on-click=${onClick} class=${queueItemClasses} data-video-id=${videoId}>
        <h1>${name}</h1>
        <small>${userName}</small>
    </li>
    `;
});