import { randomUUID } from "crypto";
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

export function createKeyPress() {
  let listeners: Listener[] = [];

  process.stdin.on("keypress", (str, key) => {
    if (key.ctrl && key.name === "c") {
      console.log("Terminar processo!");
      return process.exit();
    }

    const listener = listeners.find((listener) => {
      const query = listener.key === key.name && listener.ctrl === key.ctrl && listener.shift === key.shift;
      // console.log("[query]", { listener, key }, query);
      return query;
    });

    if (listener) listener.callback();
  });

  function on(...props: OnParams) {
    const [key, modifiers, callback] = props;

    const newListener: Partial<Listener> = {
      id: randomUUID(),
      key,
      ctrl: false,
      shift: false,
    };

    if (callback && typeof modifiers !== "function") {
      newListener.callback = callback;
      newListener.ctrl = modifiers.ctrl || false;
      newListener.shift = modifiers.shift || false;
    }

    if (typeof modifiers === "function") {
      newListener.callback = modifiers;
    }

    listeners.push(newListener as Listener);

    return newListener.id;
  }

  function off(key: string) {
    listeners = listeners.filter((listener) => listener.key !== key);
  }

  return { on, off };
}
