import XRayLogger from "@applicaster/quick-brick-xray";
import { localStorage } from "@applicaster/zapp-react-native-bridge/ZappStorage/LocalStorage";
import { ContextKeysManager } from "@applicaster/zapp-react-native-utils/appUtils/contextKeysManager";

const IAI_NAMESPACE = "zapp_analytics_plugin_iai";
const IAI_ANALYTIC_STATUS = "analytic_status";

let loggers = {};

export const getAppVersion = async() => {
  const appVersion = await ContextKeysManager.instance.getKey({ key: 'version_name', namespace: 'applicaster.v2' });

  return appVersion;
}

export const getAccessToken = async (key, namespace) => {
  const accessToken = await ContextKeysManager.instance.getKey({ key, namespace });

  return accessToken;
}

export const getFbToken = async (key, namespace) => {
  const fbToken = await ContextKeysManager.instance.getKey({ key, namespace });
  
  return fbToken;
}
export const getAnalyticStatus = async () => {
  const analyticStatus = await localStorage.getItem(IAI_ANALYTIC_STATUS, IAI_NAMESPACE);
  return analyticStatus;
}

export const setAnalyticStatus = async () => {
  const analyticStatus = await localStorage.setItem(IAI_ANALYTIC_STATUS, true, IAI_NAMESPACE);
  return analyticStatus;
}

export const BaseCategories = {
  ANALYTICS: "analytics",
};

export const BaseSubsystem = "plugins/zapp_analytics_plugin_iai";

export const Subsystems = {
  PROFILES: `${BaseSubsystem}/analytic_status`,
};

export function createLogger({ category = "", subsystem }) {
  if (!subsystem) {
    return null;
  }

  const logger = new XRayLogger(category, subsystem);

  loggers[subsystem] = logger;

  return logger;
}
