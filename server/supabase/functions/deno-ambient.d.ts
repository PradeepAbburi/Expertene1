// Ambient typings to quiet editor/TS server for Deno-based Supabase Edge Functions
// These are lightweight shims for the editor only. The real runtime is Deno on Supabase.

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  // allow indexing for other uses
  [key: string]: any;
};

declare module '@supabase/supabase-js' {
  // Minimal shape used by our functions in this repo
  export function createClient(url: string, key: string): any;
  const _default: any;
  export default _default;
}

declare module 'https://deno.land/x/smtp/mod.ts' {
  export function connect(opts: any): Promise<any>;
}

declare module 'https://deno.land/std@0.203.0/uuid/mod.ts' {
  export const v4: {
    generate: () => string;
  };
}

// Generic remote module declaration fallback (optional)
// Note: avoid broad wildcard module patterns; specific remote URLs are declared above.
