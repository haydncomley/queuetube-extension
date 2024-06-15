import { component, computed, ref, render, state, valueOf } from "../../../_nice";
import { globalStore } from "../store";

import styles from './Player.module.css';

const VIDEO_FETCH_TIMEOUT = 500;

export const Player = component(() => {
    const queue = globalStore('queue');
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

            const onPlay = () => {
                queue.set({
                    list: valueOf(queue)?.list || [],
                    playing: {
                        index: valueOf(queue)?.playing?.index || 0,
                        state: 'playing'
                    }
                });
            }

            const onPause = () => {
                queue.set({
                    list: valueOf(queue)?.list || [],
                    playing: {
                        index: valueOf(queue)?.playing?.index || 0,
                        state: 'paused'
                    }
                });
            }

            const onEnded = () => {
                embeddedVideo.removeEventListener('play', onPlay);
                embeddedVideo.removeEventListener('pause', onPause);
                embeddedVideo.removeEventListener('ended', onEnded);

                queue.set({
                    list: valueOf(queue)?.list || [],
                    playing: {
                        index: (valueOf(queue)?.playing?.index || 0) + 1,
                    }
                });
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