declare module 'which' {
  interface Options {
    nothrow?: boolean;
    path?: string;
    env?: string;
  }

  function whichSync(command: string, options?: Options): string | null;

  namespace whichSync {
    function sync(command: string, options?: Options): string | null;
  }

  export = whichSync;
}
