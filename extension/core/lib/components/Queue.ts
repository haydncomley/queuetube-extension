import { component, computed, mapper, render, state, valueOf } from "../../../_nice";
import { globalStore } from "../store";

import styles from './Queue.module.css';
import { QueueItem } from "./QueueItem";

export const Queue = component(() => {
    const queue = globalStore('queue');

    const queueItems = computed(() => {
        const currentQueue = valueOf(queue);
        if (!currentQueue?.list.length) return QueueItem({});
        return mapper(currentQueue.list, (item) => QueueItem({ details: item }));
    }, [queue]);


    return render`
    <ol class=${styles.queueList}>
        ${queueItems}
    </ol>
    `;
});