import moment from "moment";

import {
  ContextKeysManager,
  StorageLevel,
} from "@applicaster/zapp-react-native-utils/appUtils/contextKeysManager";
import { isEmptyOrNil } from "@applicaster/zapp-react-native-utils/cellUtils";
import { localStorage } from "@applicaster/zapp-react-native-bridge/ZappStorage/LocalStorage";
import { LoginDataKeys } from "../models/Response";
import { createLogger } from "./loggerService";

export const BaseSubsystem = "plugins/zapp-ch-media-login";

export const CH_MEDIA_NAMESPACE = "ch-media-login";

export const DEFAULT_STORAGE = StorageLevel.default;

export const PERSISTED_STORAGE = StorageLevel.persisted;

export const BaseCategories = { GENERAL: "general" };

export const logger = createLogger();

export async function setStorageItem(
  key: string,
  value: ValueArg,
  namespace = CH_MEDIA_NAMESPACE,
  storageLevel = PERSISTED_STORAGE
): Promise<boolean> {
  const keyToSet: SetKeyArg = { key: { key, namespace }, value, storageLevel };

  if (isEmptyOrNil(value)) {
    logger.warn({
      message: `You are trying to set an empty value for ${key} into storage`,
      data: {
        key,
        namespace,
        value,
        storageLevel,
      },
    });

    return false;
  }

  const result = await ContextKeysManager.instance.setKey(keyToSet);

  if (!result) {
    logger.debug({
      message: `Failed to set ${key} in storage`,
      data: {
        key,
        namespace,
        value,
        storageLevel,
      },
    });

    return result;
  }

  logger.debug({
    message: `Successfully set ${key} into storage`,
    data: {
      key,
      namespace,
      value,
      storageLevel,
    },
  });

  return result;
}

export async function removeStorageItems(
  keys: string[],
  namespace = CH_MEDIA_NAMESPACE
) {
  const keyToRemove = keys.map((key: string) => {
    return {
      key,
      namespace,
    };
  });

  return ContextKeysManager.instance.removeKeys(keyToRemove);
}

export async function getStorageItem(
  key: string,
  namespace = CH_MEDIA_NAMESPACE
): Promise<any> {
  // Searching for selectedProfile key using namespace returns null
  // Without namespace it retrieves the storage item correctly
  const keyToSearch = namespace ? { key, namespace } : key;

  const result = await ContextKeysManager.instance.getKey(keyToSearch);

  if (!result) {
    logger.debug({
      message: `Failed to retreive ${key} from storage, it may not exist yet`,
      data: {
        key,
        namespace,
      },
    });

    return result;
  }

  logger.debug({
    message: `Successfully retreived ${key} from storage`,
    data: {
      key,
      namespace,
      value: result,
    },
  });

  return result;
}

export async function setAppToken(appToken: AppToken) {
  await setStorageItem(LoginDataKeys.app_token_string, appToken.token);

  return localStorage.setItem(
    LoginDataKeys.app_token,
    appToken,
    CH_MEDIA_NAMESPACE
  );
}

export async function getAppToken() {
  return localStorage.getItem(LoginDataKeys.app_token, CH_MEDIA_NAMESPACE);
}

export async function removeAppToken() {
  // TODO: Delete app token from storage
  return localStorage.removeItem(LoginDataKeys.app_token, CH_MEDIA_NAMESPACE);
}

export async function saveKalturaSession(ks: string, expiry: number) {
  const expiryPromise = setStorageItem(LoginDataKeys.ks_expires, expiry);
  const ksPromise = setStorageItem(LoginDataKeys.ks_token, ks);

  return Promise.all([expiryPromise, ksPromise]);
}

export async function removeKalturaSession() {
  return removeStorageItems([LoginDataKeys.ks_expires, LoginDataKeys.ks_token]);
}

export function isTokenExpired(expiresIn: number): boolean {
  return expiresIn - 60 < moment().unix();
}

export async function getKalturaSession(): Promise<string> {
  const expiry = await getStorageItem(LoginDataKeys.ks_expires);

  if (expiry && !isTokenExpired(expiry)) {
    return getStorageItem(LoginDataKeys.ks_token);
  }

  if (!expiry) {
    logger.warn({
      message: "We were unable to retreive expiry data for token, check login event.",
    });

    return getStorageItem(LoginDataKeys.ks_token);
  }

  logger.info({
    message: "Kaltura session expired, removing",
  });

  await removeKalturaSession();

  return null;
}

export async function removeUserInfo() {
  return removeStorageItems([LoginDataKeys.user_id, LoginDataKeys.user_data]);
}

export async function saveUserInfo(params: LoginData) {
  const mapping = {
    [LoginDataKeys.user_data]: params?.user,
    [LoginDataKeys.user_id]: params?.user?.id,
  };

  const desiredKeys = Object.keys(mapping);

  try {
    desiredKeys.forEach(async (key) => {
      if (key && mapping?.[key]) {
        await setStorageItem(key, mapping[key]);
      }
    });

    logger.debug({
      message: "saveUserInfo: user info saved",
      data: { receivedParams: params, storedParams: mapping },
    });

    return true;
  } catch (error) {
    logger.error({
      message: "saveUserInfo: failed to store",
      data: { error, params },
    });

    throw error;
  }
}

export async function removeDataFromStorages() {
  logger.debug({
    message: "removeDataFromStorages: success",
  });

  return Promise.all([
    removeKalturaSession(),
    removeUserInfo(),
    removeAppToken(),
    removeStorageItems([LoginDataKeys.user_id, LoginDataKeys.user_data, LoginDataKeys.selectedProfile]),
  ]);
}
