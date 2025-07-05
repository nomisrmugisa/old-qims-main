/**
 * Created by fulle on 2025/07/04.
 */
const eventBus = {
    listeners: {},
    listAllListeners() {
        console.log("Current listeners:", this.listeners);
    },
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        // Prevent duplicate listeners
        if (!this.listeners[event].includes(callback)) {
            this.listeners[event].push(callback);
        }

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
        const now = Date.now();
        if (this.lastEmitTimes?.[event] && now - this.lastEmitTimes[event] < 100) {
            return; // Skip if same event was emitted <100ms ago
        }
        this.lastEmitTimes = { ...this.lastEmitTimes, [event]: now };
        [...this.listeners[event]].forEach((callback) => {
            try {
                callback(...args);
            } catch (err) {
                console.error(`Error in ${event} listener`, err);
            }
        });
    },
};

export default eventBus;