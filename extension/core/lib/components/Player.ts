import { component, computed, ref, render, state, valueOf } from "../../../_nice";
import { dbUpdateQueue } from "../database";
import { globalStore } from "../store";

import styles from './Player.module.css';

const VIDEO_FETCH_TIMEOUT = 500;
let LISTENER_TIMEOUTS:  NodeJS.Timeout[] = [];

export const Player = component(() => {
    const embedRef = ref<HTMLIFrameElement>();

    const queue = globalStore('queue');
    const session = globalStore('session');
    const user = globalStore('user');

    computed(() => {
        const iframe = embedRef.get();
        if (!iframe) return;

        const videoPlayer = iframe.contentDocument?.body.querySelector('video');
        if (!videoPlayer) return;

        const wantedQueue = valueOf(queue);
        const list = wantedQueue?.list ?? [];
        const playing = wantedQueue?.playing;

        if (list.length === 0) return;

        const wantedID = list[playing?.index || 0].id;
        const wantedTime = playing?.seek || 0;
        const isNewVideo = !iframe.src.includes(wantedID);

        if (isNewVideo) return;

        if (wantedTime !== videoPlayer.currentTime) videoPlayer.currentTime = wantedTime;
        if (playing?.state === 'playing' && videoPlayer.paused) videoPlayer.play();
        if (playing?.state === 'paused' && !videoPlayer.paused) videoPlayer.pause();
    }, [queue, embedRef]);

    computed(() => {
        const iframe = embedRef.get();
        if (!iframe) return;

        const wantedQueue = valueOf(queue);
        const list = wantedQueue?.list ?? [];
        const playing = wantedQueue?.playing;

        const wantedID = list[playing?.index || 0]?.id ?? '';
        const wantedTime = playing?.seek || 0;
        const isNewVideo = !iframe.src.includes(wantedID);
        const nextIndex = (playing?.index || 0) + 1;

        if (!wantedID) return;
        if(isNewVideo) iframe.src = `https://www.youtube.com/embed/${wantedID}?autoplay=1&controls=1`;
        else return;

        const attachListeners = () => {
            if (!iframe?.contentDocument || !iframe.contentDocument.body) {
                LISTENER_TIMEOUTS.push(setTimeout(attachListeners, VIDEO_FETCH_TIMEOUT));
                return;
            };
            const embeddedVideo = iframe.contentDocument.body.querySelector('video');
            if (!embeddedVideo) {
                LISTENER_TIMEOUTS.push(setTimeout(attachListeners, VIDEO_FETCH_TIMEOUT))
                return;
            };

            document.body.querySelector(`[data-video-id="${wantedID}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

            LISTENER_TIMEOUTS.forEach(clearTimeout);
            LISTENER_TIMEOUTS = [];

            const isVideoSeeking = () => {
                return embeddedVideo.seeking;
            }

            const isNetworkVideoPlaying = () => {
                return valueOf(queue)?.playing?.state === 'playing';
            }

            const onPlay = async () => {
                if (!isNetworkVideoPlaying()) {
                    const newQueue = valueOf(queue)!;
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
                if (!isVideoSeeking() && isNetworkVideoPlaying()) {
                    const newQueue = valueOf(queue)!;
                    newQueue.playing = {
                        index: valueOf(queue)?.playing?.index || 0,
                        state: 'paused',
                        seek: embeddedVideo.currentTime,
                        lastUser: valueOf(user),
                    }
                    queue.set(await dbUpdateQueue(valueOf(session)?.id!, newQueue));
                };
            }

            const onEnded = async () => {
                embeddedVideo.removeEventListener('play', onPlay);
                embeddedVideo.removeEventListener('pause', onPause);
                embeddedVideo.removeEventListener('ended', onEnded);

                const newQueue = valueOf(queue)!;
                newQueue.playing = {
                    index: nextIndex,
                    seek: 0,
                    state: 'playing',                
                }
                
                queue.set(await dbUpdateQueue(valueOf(session)?.id!, newQueue));
            }

            embeddedVideo.addEventListener('play', onPlay);
            embeddedVideo.addEventListener('pause', onPause);
            embeddedVideo.addEventListener('ended', onEnded);
            embeddedVideo.currentTime = wantedTime;
            if (isNetworkVideoPlaying()) embeddedVideo.play();
            else embeddedVideo.pause();
        }

        LISTENER_TIMEOUTS.push(setTimeout(attachListeners, VIDEO_FETCH_TIMEOUT));
    }, [embedRef, queue]);

    const playerClasses = computed(() => {
        return [
            styles.player,
            !valueOf(queue)?.playing ? styles.playerInActive : ''
        ].join(' ');
    }, [queue]);

    return render`
    <div class=${playerClasses}>
        <iframe ref=${embedRef} class=${styles.playerEmbed} title="YouTube video player" frameborder="0" allow="autoplay" referrerpolicy="strict-origin-when-cross-origin"></iframe>
    </div>
    `;
});