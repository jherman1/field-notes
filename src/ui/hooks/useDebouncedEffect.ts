

import { useEffect } from "react";

export function useDebouncedEffect(
    effect: () => void,
    deps: unknown[],
    delayMs: number
) {
    useEffect(() => {
        const id = setTimeout(() => effect(), delayMs);
        return () => clearTimeout(id);
    }, [...deps, delayMs]);
}