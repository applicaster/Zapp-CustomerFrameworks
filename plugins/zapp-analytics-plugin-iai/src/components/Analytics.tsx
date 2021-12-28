/// <reference types="@applicaster/applicaster-types" />

import axios from "axios";
import * as React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import {
  getFbToken,
  getAccessToken,
  getAppVersion,
  getAnalyticStatus,
  setAnalyticStatus,
  createLogger,
  BaseCategories,
  BaseSubsystem
} from "../utils/index";

type HooksCallbackArgs = {
  success?: boolean;
  payload?: any;
  error?: Error | Boolean;
  callback?: void;
};

type Props = {
  payload: {
    home: boolean;
  };
  callback: (args: HooksCallbackArgs) => void;
  configuration: ConfigurationFields
};

const logger = createLogger({
  subsystem: BaseSubsystem,
  category: BaseCategories.ANALYTICS,
});

let shouldSkiphook;

export function Analytics(props: Props) {
  const { 
    configuration,
    callback,
  } = props;

  const {
    service_url,
    firebase_user_token_namespace: fbNamespace,
    firebase_user_token_key: fbTokenKey,
    access_token_namespace: tokenNamespace,
    access_token_key: tokenKey,
  } = configuration;

  const postAnalyticData = async () => {
    try {
      shouldSkiphook = true;

      logger.debug({
        message: `Running POST Request`,
      });

      const tokensData: Promise<string>[] = [
        getFbToken(fbTokenKey, fbNamespace),
        getAccessToken(tokenKey, tokenNamespace),
        getAppVersion()
      ];

      const [fb, key, vers] = await Promise.all(tokensData);

      const params = {
        fb,
        key,
        vers
      }

      logger.debug({
        message: `POST Request data`,
        data: { url: service_url, params }
      });

      const res = await axios.post(service_url, null, { params });

      logger.debug({
        message: `POST Response`,
        data: { status: res.status, data: res.data }
      });

      if (res.status >= 400 || !res.data.isSuccessStatusCode) {
        logger.debug({
          message: `Request failed isSuccessStatusCode ${res?.data?.isSuccessStatusCode}`,
          data: { status: res.status, data: res.data }
        });
        
        callback({ success: true });
        return;
      }

      logger.debug({
        message: `Setting analytic status flag`,
      });

      await setAnalyticStatus();

      logger.debug({
        message: `Closing hook with success`,
        data: { status: res.status, data: res.data }
      });

      callback({ success: true });

      return;
    } catch (error) {
      logger.debug({
        message: `An error ocurred in postAnalyticData`,
        data: { error }
      });

      callback({ success: true });
    }
  };

  const checkAnalyticStatus = async () => {

    const prevStatus = await getAnalyticStatus();

    logger.debug({
      message: `Successful Previous POST Request: ${prevStatus}`,
      data: { prevStatus }
    });

    if (prevStatus) {
      logger.debug({
        message: `Setting skip hook flag`,
        data: { prevStatus }
      });

      shouldSkiphook = true;

      logger.debug({
        message: `Closing hook with success`,
      });

      callback({ success: true });
      return;
    }

    postAnalyticData();
  };

  React.useEffect(() => {
    logger.debug({
      message: `Component mounted`,
    });

    checkAnalyticStatus();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  );
}

export const shouldSkipHook = () => {
  return shouldSkiphook;
};
