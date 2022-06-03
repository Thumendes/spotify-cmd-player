export interface KeyModifiers {
  ctrl?: boolean;
  shift?: boolean;
}

export interface Listener extends KeyModifiers {
  id: string;
  key: string;
  callback: () => Promise<void> | void;
}

export type OnParams = [string, KeyModifiers, Listener["callback"]] | [string, Listener["callback"]];
