import * as R from "ramda";
import uuidv4 from "uuid/v4";
import { LoginData, LoginDataKeys } from "../../../models/Response";
import { createLogger } from "../../../Services/loggerService";
import {
  getAppToken,
  getKalturaSession,
  getStorageItem,
  saveKalturaSession,
  setStorageItem,
} from "../../../Services/storageService";
import { refreshKs } from "../../../Services/authorize";

const { ks_token, device_id, expiry, user_data, user_id, app_token_string } =
  LoginDataKeys;

const DEFAULT_CTX_KEYS = {
  deviceName: "deviceName",
  deviceId: "device_id",
  applicaster: "applicaster.v2",
  chMedia: "ch-media-login",
};

const logger = createLogger();

export const getRiversProp = (key, rivers = {}, screenId = "") => {
  const getPropByKey = R.compose(
    R.prop(key),
    R.find(R.propEq("id", screenId)),
    R.values
  );

  return getPropByKey(rivers);
};

export function isPlayerHook(payload: ZappEntry): boolean {
  if (!payload) {
    return false;
  }

  return R.compose(
    R.propEq("plugin_type", "player"),
    R.prop(["targetScreen"])
  )(payload);
}

export function pluginByScreenId({ rivers, screenId }) {
  let plugin = null;

  if (screenId && screenId?.length > 0) {
    plugin = rivers?.[screenId];
  }

  return plugin || null;
}

export const isHomeScreen = (navigator) => {
  return R.pathOr(false, ["payload", "home"], navigator.screenData);
};

export const isAuthenticationRequired = (payload: ZappEntry) => {
  const requires_authentication = R.path([
    "extensions",
    "requires_authentication",
  ])(payload);

  logger.debug({
    message: `Payload entry is requires_authentication: ${!!requires_authentication}`,
    data: {
      requires_authentication: !!requires_authentication,
    },
  });

  return !!requires_authentication;
};

export async function isTokenAvailable(): Promise<boolean> {
  try {
    const ksToken = await getStorageItem(ks_token);

    return ksToken;
  } catch (error) {
    logger.warning({
      message: "ksNotAvailable: error",
      data: { error },
    });

    throw error;
  }
}

export async function getLoginContextDataFromStorage() {
  try {
    const deviceName = await getStorageItem(
      DEFAULT_CTX_KEYS.deviceName,
      DEFAULT_CTX_KEYS.applicaster
    );

    let deviceId = await getStorageItem(DEFAULT_CTX_KEYS.deviceId); // from ch-media-login namespace

    // on ios device id might not be present based on user's permission, generating it for the first time\
    if (!deviceId) {
      deviceId = uuidv4();
      await setStorageItem(DEFAULT_CTX_KEYS.deviceId, deviceId);
    }

    const data = { deviceName, deviceId };

    if (deviceName && deviceId) {
      logger.debug({
        message:
          "getLoginContextDataFromStorage: sucessfully retreived values from local storage",
        data: { data },
      });

      return data;
    }

    logger.debug({
      message:
        "getLoginContextDataFromStorage: could not retreive one or more keys for device data from local storage",
      data: { data },
    });
  } catch (error) {
    logger.warning({
      message:
        "getLoginContextDataFromStorage: failed to retrieve values from local storage",
      data: { error },
    });
  }
}
