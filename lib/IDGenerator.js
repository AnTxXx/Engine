

export function new_counter(init = 0) {
    return {
        next: () => ++init
    };
}

export const Counter = new_counter(1);