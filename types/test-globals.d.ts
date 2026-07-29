declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const afterEach: any;
declare const expect: any;
declare const jest: any;

declare namespace jest {
  type Mock = any;
}

declare module "jest-axe" {
  export function axe(container: Element): Promise<unknown>;
  export const toHaveNoViolations: Record<string, unknown>;
}
