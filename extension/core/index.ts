import { app, computed, render, state, valueOf } from '../_nice';
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
    const isOpen = state(false);

    const currentPage = computed(() => {
        if (!valueOf(user)) return NoUser();
        if (!valueOf(session)) return NoSession();
        return InSession();
    }, [user, session]);

    const toggleOpen = computed(() => {
        isOpen.set(!valueOf(isOpen));
    });

    const toggleLabel = computed(() => {
        return valueOf(isOpen) ? 'Hide' : 'Queue';
    }, [isOpen]);

    const qtClasses = computed(() => {
        return [
            styles.qtRoot,
            valueOf(isOpen) && styles.qtRootOpen,
            valueOf(session) && styles.qtRootConnected,
        ].join(' ');
    }, [isOpen, session]);
    

    return render`
    <section class=${qtClasses}>
        <button on-click=${toggleOpen} class=${styles.toggle}>
            ${toggleLabel}
        </button>

        ${currentPage}
    </section>
    `;
}, '#QT');
