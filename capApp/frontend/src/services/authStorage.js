import { Preferences } from '@capacitor/preferences';
import { isNativeApp } from '../utils/platform';

const TOKEN_KEY = 'authToken';

export async function getAuthToken() {
  if (!isNativeApp()) {
    return null;
  }

  const { value } = await Preferences.get({ key: TOKEN_KEY });
  return value || null;
}

export async function setAuthToken(token) {
  if (!isNativeApp() || !token) {
    return;
  }

  await Preferences.set({ key: TOKEN_KEY, value: token });
}

export async function clearAuthToken() {
  if (!isNativeApp()) {
    return;
  }

  await Preferences.remove({ key: TOKEN_KEY });
}
