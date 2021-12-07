export interface LoginData {
  session: {
    ks?: string;
    expiry?: number;
    app?: {
      token: string;
      id: string;
    };
  };
  deviceId?: string;
  udid?: string;
  user: any;
}

export interface LoginDataRefresh {
  client_id: string;
  ks_token: string;
  expiry: number;
  refresh_token: string;
  udid: string;
}

export const LoginDataKeys = {
  client_id: "client_id",
  ks_token: "ks",
  expiry: "expiry",
  ks_expires: "ks_expires",
  app_token: "appToken",
  app_token_string: "app_token",
  udid: "udid",
  device_id: "device_id",
  user_data: "user_data",
  user_id: "user_id",
  selectedProfile: "selectedProfile"
};
