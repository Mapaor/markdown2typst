// Ambient declarations for external modules that are provided as runtime dependencies
// These are intentionally minimal so consumers don't need the dev-only @types packages.

declare module 'country-list' {
    export function getCode(name: string): string | undefined;
    export function getCodes(): string[];
}

declare module 'langs' {
    export interface Lang {
        name?: string;
        local?: string;
        '1'?: string;
        '2'?: string;
        '2B'?: string;
        '3'?: string;
        [key: string]: any;
    }

    export function codes(type: string): string[];
    export function all(): Lang[];
    export function where(codeType: string, value: string): Lang | undefined;
    const langs: {
        codes: typeof codes;
        all: typeof all;
        where: typeof where;
    };
    export default langs;
}

declare module 'js-yaml' {
    export function load(s: string): any;
    export function dump(o: any): string;
}

export {};
