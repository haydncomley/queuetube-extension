import { component, computed, render, state, valueOf } from "../../../_nice";
import { globalStore } from "../store";

import styles from './NoUser.module.css';

export const NoUser = component(() => {
    const user = globalStore('user');
    const name = state('');

    const onChange = computed<Event>((e) => {
        const target = e.target as HTMLInputElement;
        name.set(target.value);
    });

    const onSave = computed(() => {
        const wantedName = valueOf(name);
        if (!wantedName) return alert('Name cant be empty!');
        user.set({ name: wantedName });
    });

    return render`
    <div class=${styles.noUser}>
        <input on-input=${onChange} placeholder="Name" />
        <button on-click=${onSave}>Save</button>
    </div>
    `;
});