import { writable } from 'svelte/store';

interface ConfigMouseEventFields {
  clientX: number;
  clientY: number;
  screenX: number;
  screenY: number;
}

interface ConfigWindowFields {
  screen: {
    width: number;
    height: number;
  };
}

interface ConfigWindowCalibrationFields {
  mouse: ConfigMouseEventFields;
  window: ConfigWindowFields;
}

export const inputWindowFieldsConfig = writable<ConfigWindowCalibrationFields | null>(null);

export const setConfigWindowFields = (
  mouse: ConfigMouseEventFields,
  window: ConfigWindowFields
) => {
  inputWindowFieldsConfig.set({ mouse, window });
};
