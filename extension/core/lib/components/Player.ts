import { component, computed, ref, render, state, valueOf } from "../../../_nice";
import { dbUpdateQueue } from "../database";
import { globalStore } from "../store";

import styles from './Player.module.css';

const VIDEO_FETCH_TIMEOUT = 500;

export const Player = component(() => {
    const session = globalStore('session');
    const queue = globalStore('queue');
    const user = globalStore('user');
    const embedRef = ref<HTMLIFrameElement>();
    const currentVideoId = state('');

    computed(() => {
        const playingIndex = valueOf(queue)?.playing?.index;
        const list = valueOf(queue)?.list;
        if(typeof playingIndex !== 'number' || !list) return;
        if(!list.length) return;
        
        const videoId = list[playingIndex]?.id;

        if (videoId !== valueOf(currentVideoId)) {
            currentVideoId.set(videoId);
        }

        const iframe = embedRef.get()

        if (iframe && valueOf(queue)?.playing?.lastUser?.name !== valueOf(user)?.name) {
            const embeddedVideo = iframe.contentDocument?.body.querySelector('video'); 
            if (!embeddedVideo) return;
            const isQueuePaused = valueOf(queue)?.playing?.state === 'paused';
            const queueSeek = valueOf(queue)?.playing?.seek;
            const isVideoPaused = embeddedVideo.paused;

            if (queueSeek && queueSeek !== embeddedVideo.currentTime) embeddedVideo.currentTime = queueSeek;

            if (isQueuePaused && !isVideoPaused) {
                embeddedVideo.pause();
            } else if (!isQueuePaused && isVideoPaused) {
                embeddedVideo.play();
            }
        }
    }, [queue]);

    computed(() => {
        const iframe = embedRef.get();
        if (!iframe || !valueOf(currentVideoId)) return;
        iframe.contentWindow?.location.replace(`https://www.youtube.com/embed/${valueOf(currentVideoId)}?autoplay=1&controls=1`);

        const attachListeners = () => {
            if (!iframe?.contentDocument || !iframe.contentDocument.body) return setTimeout(attachListeners, VIDEO_FETCH_TIMEOUT);
            const embeddedVideo = iframe.contentDocument.body.querySelector('video');
            if (!embeddedVideo) return setTimeout(attachListeners, VIDEO_FETCH_TIMEOUT);

            document.body.querySelector(`[data-video-id="${valueOf(currentVideoId)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
            const nextIndex = (valueOf(queue)?.playing?.index || 0) + 1;

            const onPlay = async () => {
                const newQueue = valueOf(queue)!;
                    if (valueOf(queue)?.playing?.seek !== embeddedVideo.currentTime || valueOf(queue)?.playing?.state === 'paused'){
                    newQueue.playing = {
                        index: valueOf(queue)?.playing?.index || 0,
                        state: 'playing',
                        seek: embeddedVideo.currentTime,
                        lastUser: valueOf(user),
                    }
                    
                    queue.set(await dbUpdateQueue(valueOf(session)?.id!, newQueue));
                }
            }

            const onPause = async () => {
                if (embeddedVideo.seeking) return;
                const newQueue = valueOf(queue)!;
                newQueue.playing = {
                    index: valueOf(queue)?.playing?.index || 0,
                    state: 'paused',
                    seek: embeddedVideo.currentTime,
                    lastUser: valueOf(user),
                }
                
                queue.set(await dbUpdateQueue(valueOf(session)?.id!, newQueue));
            }

            const onEnded = async () => {
                embeddedVideo.removeEventListener('play', onPlay);
                embeddedVideo.removeEventListener('pause', onPause);
                embeddedVideo.removeEventListener('ended', onEnded);

                const newQueue = valueOf(queue)!;
                newQueue.playing = {
                    index: nextIndex,
                }
                
                queue.set(await dbUpdateQueue(valueOf(session)?.id!, newQueue));
            }

            embeddedVideo.addEventListener('play', onPlay);
            embeddedVideo.addEventListener('pause', onPause);
            embeddedVideo.addEventListener('ended', onEnded);
            onPlay();
        }

        setTimeout(attachListeners, VIDEO_FETCH_TIMEOUT);
    }, [currentVideoId, embedRef])

    const playerClasses = computed(() => {
        return [
            styles.player,
            !valueOf(currentVideoId) ? styles.playerInActive : ''
        ].join(' ');
    }, [currentVideoId]);

    return render`
    <div class=${playerClasses}>
        <iframe ref=${embedRef} class=${styles.playerEmbed} title="YouTube video player" frameborder="0" allow="autoplay" referrerpolicy="strict-origin-when-cross-origin"></iframe>
    </div>
    `;
});