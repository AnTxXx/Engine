export interface Counter {
    next(): number;
    reset(): void;
}

export function new_counter(init = 0): Counter {
    return {
        next: () => ++init,
        reset: () => init = 0
    };
}

export const IncrementOneCounter = new_counter(0);