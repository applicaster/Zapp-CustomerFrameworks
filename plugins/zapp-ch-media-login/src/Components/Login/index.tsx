import { SafeAreaView } from "@applicaster/zapp-react-native-ui-components/Components/SafeAreaView";
import { useNavigation } from "@applicaster/zapp-react-native-utils/reactHooks/navigation";
import { platformSelect } from "@applicaster/zapp-react-native-utils/reactUtils";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { WebView } from "react-native-webview";
import { createLogger } from "../../Services/loggerService";
import { showAlert } from "../../Utils/Account";
import { getStyles } from "../../Utils/Customization";
import { getLocalizations } from "../../Utils/Localizations";
import FloatingButton from "../FloatingButton";
import {
  getRiversProp,
  isAuthenticationRequired,
  isHomeScreen,
  isPlayerHook,
  getLoginContextDataFromStorage,
} from "./Utils";

import {
  getKalturaSession,
  saveKalturaSession,
  saveUserInfo,
  setAppToken,
  removeDataFromStorages,
} from "../../Services/storageService";

import { refreshToken } from "../../Services/authorize";
import { RESPONSES } from "./Utils/const";

const logger = createLogger();

export const Login = (props) => {
  const navigator = useNavigation();
  const [loading, setLoading] = useState(true);
  const [loginParams, setLoginParams] = useState(null);

  const { callback, payload, rivers } = props;
  const screenId = navigator?.activeRiver?.id;

  const localizations = getRiversProp("localizations", rivers, screenId);
  const styles = getRiversProp("styles", rivers, screenId);
  const general = getRiversProp("general", rivers, screenId);

  const logoutCompletionAction =
    general?.logout_completion_action ||
    props.configuration?.logout_completion_action;

  const loginCompletionAction = general?.login_completion_action;
  const targetScreen = rivers?.[general?.navigate_to];

  const screenStyles = getStyles(styles);
  const screenLocalizations = getLocalizations(localizations);

  const {
    configuration: {
      loginUrl,
      appTokenEndpoint,
      anonymousSessionEndpoint,
      startSessionEndpoint,
      apiVersion,
      partnerId,
    },
  } = props;

  const refreshConfig = {
    appTokenEndpoint,
    anonymousSessionEndpoint,
    startSessionEndpoint,
    apiVersion,
    partnerId,
  };

  const mounted = useRef(true);

  async function onLogout() {
    await removeDataFromStorages();

    logger.debug({
      message: "onLogout: removed data from storages",
    });

    if (logoutCompletionAction === "go_home") {
      logger.debug({
        message: `onLogout: logout completion action: ${logoutCompletionAction}`,
        data: { logoutCompletionAction },
      });

      return navigator.goHome();
    } else {
      logger.debug({
        message: `onLogout: logout completion action: ${logoutCompletionAction}`,
        data: { logoutCompletionAction },
      });

      return navigator.goBack();
    }
  }

  function handleSuccess(message: string, data = {}) {
    logger.debug({ message, data });

    mounted.current &&
      callback &&
      callback({
        success: true,
        error: null,
        payload,
      });

    return true;
  }

  async function setupEnvironment() {
    try {
      const playerHook = isPlayerHook(props?.payload);

      const testEnvironmentEnabled =
        props?.configuration?.force_authentication_on_all || "off";

      const noAuthenticationRequired =
        playerHook &&
        testEnvironmentEnabled === "off" &&
        !isAuthenticationRequired(payload);

      if (noAuthenticationRequired) {
        return handleSuccess(RESPONSES.setupSkip);
      }

      const session = await getKalturaSession();
      const isUserLoggingOut = session && !playerHook && !callback;


      if (session && !isUserLoggingOut) {
 
        return handleSuccess(RESPONSES.alreadyLoggedIn, {session, isUserLoggingOut});
      }

      if (isUserLoggingOut) {
        return onLogout();
      }

      const contextData = await getLoginContextDataFromStorage();

      if (!contextData) {
        logger.error({
          message:
            "setupEnvironment: There was an error retrieving context data",
          data: contextData,
        });
      }

      const brandId = platformSelect({
        ios: 1,
        android: 31,
        android_tv: 105,
        tvos: 1,
      });

      const params = `?deviceId=${encodeURIComponent(
        contextData.deviceId
      )}&brandId=${brandId}&name=${encodeURIComponent(
        contextData?.deviceName
      )}`;

      setLoginParams(params);

      if (!session) {
        logger.debug({
          message: "setupEnvironment: Presenting login screen",
          data: { session, params },
        });

        setLoading(false);
      } else {
        // const session = getKalturaSession();
        // TODO: Do not refresh if not needed
        const success = await refreshToken(refreshConfig);

        if (callback) {
          return handleSuccess(RESPONSES.success + success, {
            params,
            session,
            success,
          });
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);

      logger.error({
        message: "setupEnvironment: Error",
        data: { error },
      });

      showAlert(
        screenLocalizations?.general_error_title,
        screenLocalizations?.general_error_message
      );
    }
  }

  async function onMessage(event) {
    try {
      const data = event?.nativeEvent?.data;
      const parsedData: LoginData = JSON.parse(data);

      logger.debug({
        message: "onMessage: Login screen send event",
        data: { data, parsed_data: parsedData },
      });

      const udid = parsedData?.udid;
      const ks = parsedData?.session?.ks;
      // TODO: find out why we aren't getting expiry
      const expiry = parsedData?.session?.expiry;
      await saveKalturaSession(ks, expiry);
      await saveUserInfo(parsedData);

      const refreshKsParams = {
        ks,
        apiVersion,
        appToken: {
          hashType: "SHA256",
        },
      };

      logger.debug({
        message: "onMessage: Creating app token",
        data: { data, parsed_data: parsedData },
      });

      const appTokenResponse = await axios
        .post(appTokenEndpoint, refreshKsParams)
        .then((res) => res.data);

      if (appTokenResponse.error) {
        logger.error({
          message: "onMessage: Failed to obtain app token",
          data: { data, error: appTokenResponse.error },
        });

        return;
      }

      const id = appTokenResponse.result.id;
      const token = appTokenResponse.result.token;
      const appToken: AppToken = { id, token, udid };
      await setAppToken(appToken);

      logger.debug({
        message: "onMessage: Login screen completed",
        data: { data, appToken },
      });

      if (!callback) {
        if (loginCompletionAction) {
          navigator.replace(targetScreen);
        } else {
          navigator.goHome();
        }
      }

      mounted.current &&
        callback &&
        callback({ success: true, error: null, payload });
    } catch (error) {
      logger.error({
        message: "onMessage: error",
        data: { error },
      });

      showAlert(
        screenLocalizations?.general_error_title,
        screenLocalizations?.general_error_message
      );
    }
  }

  function onClose() {
    if (!callback) {
      if (logoutCompletionAction === "go_home") {
        logger.debug({
          message: `onClose: close completion action: ${logoutCompletionAction}`,
          data: { logoutCompletionAction },
        });

        return navigator.goHome();
      } else {
        logger.debug({
          message: `onClose: close completion action: ${logoutCompletionAction}`,
          data: { logoutCompletionAction },
        });

        return navigator.goBack();
      }
    }

    mounted.current &&
      callback &&
      callback({ success: false, error: null, payload });

    logger.debug({
      message: "onClose: Close button pushed",
    });
  }

  useEffect(() => {
    mounted.current = true;

    setupEnvironment();

    return () => {
      mounted.current = false;
    };
  }, []);

  function renderFlow() {
    const backgroundColor = screenStyles?.background_color;
    const loginUrlWithParams = loginUrl + loginParams;
    const shouldRender = loading === false && loginParams;

    const message = !shouldRender
      ? "Attempted to render login page but url params are missing"
      : "Rendering login page: using url from zapp + params from storage";

    logger.debug({
      message,
      data: { url: loginUrlWithParams, loading },
    });

    const safeAreaStyles = {
      flex: 1,
      backgroundColor: backgroundColor,
    };

    const webViewStyles = {
      backgroundColor: "transparent",
    };

    return shouldRender ? (
      <>
        <SafeAreaView style={safeAreaStyles}>
          {!loading && (
            <>
              <WebView
                style={webViewStyles}
                source={{
                  uri: loginUrlWithParams,
                }}
                onMessage={onMessage}
              />
            </>
          )}
        </SafeAreaView>
        {!loading && !isHomeScreen(navigator) && (
          <FloatingButton
            screenStyles={screenStyles}
            screenLocalizations={screenLocalizations}
            onClose={onClose}
          />
        )}
      </>
    ) : null;
  }

  return renderFlow();
};
