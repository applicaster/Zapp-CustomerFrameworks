import axios from "axios";
const crypto = require("crypto-js");

import { createLogger } from "./loggerService";
import { saveKalturaSession, getAppToken } from "./storageService";
const logger = createLogger();

export async function refreshKs(
  appToken: AppToken,
  config: Config
): Promise<RefreshResponse> {
  try {
    const {
      apiVersion,
      partnerId,
      anonymousSessionEndpoint,
      startSessionEndpoint,
    } = config;

    const anonymousSessionPayload = {
      apiVersion,
      partnerId,
    };

    const anonymousSession = await axios
      .post(anonymousSessionEndpoint, anonymousSessionPayload)
      .then((res) => res.data.result);

    logger.debug({
      message: "refreshToken: anonymousSession request successfull",
      data: {
        ...anonymousSession,
      },
    });

    const hashSHAToken = crypto.SHA256(
      `${anonymousSession.ks}${appToken.token}`
    );

    const startSessionParams: StartSessionParams = {
      apiVersion,
      id: appToken.id,
      ks: anonymousSession.ks,
      tokenHash: hashSHAToken.toString(),
      udid: appToken.udid,
    };

    const startSession = await axios
      .post(startSessionEndpoint, startSessionParams)
      .then((res) => res.data.result);

    logger.debug({
      message: "refreshToken: startSession request successfull",
      data: {
        ...anonymousSession,
      },
    });

    return startSession;
  } catch (error) {
    logger.error({
      message: "refreshToken: error requesting new ks token",
      data: {
        error,
      },
    });
  }
}

export async function refreshToken(config): Promise<boolean> {
  try {
    const appToken = await getAppToken();
    const refreshResult = await refreshKs(appToken, config);
    await saveKalturaSession(refreshResult.ks, refreshResult.expiry);

    return true;
  } catch (error) {
    logger.debug({
      message: "refreshToken: error",
      data: { error },
    });

    throw error;
  }
}
