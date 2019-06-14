

export function new_counter(init = 0) {
    return {
        next: () => ++init,
        reset: () => init = 0
    };
}

export const Counter = new_counter(0);