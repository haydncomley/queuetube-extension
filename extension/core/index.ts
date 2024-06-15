import { app, computed, render, valueOf } from '../_nice';
import styles from './index.module.css';
import { InSession } from './lib/pages/InSession';
import { NoSession } from './lib/pages/NoSession';
import { NoUser } from './lib/pages/NoUser';
import { globalStore } from './lib/store';

const root = document.createElement('div');
root.id = 'QT';
document.body.appendChild(root);

app(() => {
    const user = globalStore('user');
    const session = globalStore('session');

    const currentPage = computed(() => {
        console.log('Re-rendering index', valueOf(user), valueOf(session));
        if (!valueOf(user)) return NoUser();
        if (!valueOf(session)) return NoSession();
        return InSession();
    }, [user, session]);

    // TODO: Add into the URL the session ID for sharing
    // computed(() => {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     const sessionParam = urlParams.get('session');
    //     const sessionStored = valueOf(session)?.id;

    //     if (sessionStored && !sessionParam) {
    //         urlParams.set('session', sessionStored);
    //         window.location.search = urlParams.toString();
    //         return;
    //     }

    //     if (sessionParam && !sessionStored) {
    //         session.set({
    //             id: sessionParam,
    //             queue: [],
    //         });
    //     }
    // }, [session]);
    

    return render`
    <section class=${styles.qtRoot}>
        ${currentPage}
    </section>
    `;
}, '#QT');
