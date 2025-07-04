/**
 * Created by fulle on 2025/07/04.
 */
const eventBus = {
    listeners: {},

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
        return () => this.off(event, callback);
    },

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(
            (listener) => listener !== callback
        );
    },

    emit(event, ...args) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach((callback) => {
            callback(...args);
        });
    },
};

export default eventBus;