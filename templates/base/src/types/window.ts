export {};

declare global {
  interface Window {
    electron: {
      versions: {
        chrome: string;
        electron: string;
      };
    };
  }
}
