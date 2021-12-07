/// <reference types="@applicaster/applicaster-types" />

declare module "@applicaster/ch-media-login";

declare type ValueArg = string | number | boolean | Array<any> | Object;

declare type UserData = {
  objectType: string;
  firstName: string;
  id: string;
  lastName: string;
  username: string;
  address: string;
  affiliateCode: string;
  city: string;
  countryId: number;
  createDate: number;
  dynamicData: {
    profileName: {
      objectType: string;
      value: string;
      profileImage: string;
    };
  };
  email: string;
  externalId: string;
  facebookId: string;
  facebookImage: string;
  facebookToken: string;
  householdId: number;
  isHouseholdMaster: true;
  phone: string;
  roleIds: string;
  suspensionState: string;
  suspentionState: string;
  updateDate: number;
  userState: string;
  userType: {
    objectType: string;
    description: string;
  };
  zip: string;
  device?: string;
};

declare type User = {
  id: string;
  data: UserData;
  deviceId: string;
  dynamicData?: any;
};

declare type ProfileStorage = {
  app_token: string;
  device_id: string;
  expiry: string;
  ks: string;
  user_data: UserData;
  user_id: string;
};

declare type SetKeyArg = {
  key: {
    namespace: string;
    key: string;
  };
  value: ValueArg;
  storageLevel: import("@applicaster/zapp-react-native-utils/appUtils/contextKeysManager").StorageLevel;
};

declare type Config = {
  ksToken: string;
  apiVersion: string;
  partnerId: string;
  appTokenEndpoint: string;
  anonymousSessionEndpoint: string;
  startSessionEndpoint: string;
  deviceId: string; // should not be used on actions against Kaltura backend - used only in the web login page
  udid: string; // this string is created by the web-login using sha256(username+deviceId)
  appToken: {
    id: string;
    token: string;
  };
};

declare type StartSessionParams = {
  apiVersion: string;
  id: string;
  ks: string;
  tokenHash: string;
  udid: string;
};

declare type RefreshResponse = {
  objectType: string;
  createDate?: number;
  expiry?: number;
  ks: string;
  partnerId: number;
  privileges: string;
  udid: string;
  userId: string;
  error: any;
};

declare type ManifestKeys = {
  api_version: string;
  base_api_endpoint: string;
  switch_users_path: string;
  app_refresh_token_path: string;
  anonymous_session_path: string;
  start_session_path: string;
  partner_id: string;
  kids_home_navigation_id: string;
  basic_auth: string;
  basic_auth_header: string;
};

declare type HooksCallbackArgs = {
  success?: boolean;
  payload?: any;
  error?: Error | Boolean;
  callback?: void;
};

declare type Props = {
  payload: {
    home: boolean;
  };
  callback: (args: HooksCallbackArgs) => void;
  parentFocus?: ParentFocus;
  focused?: boolean;
};

declare type ScreenData = {
  [key: string]: any;
};
declare type LoginData = {
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
};

declare type LoginDataRefresh = {
  client_id: string;
  ks_token: string;
  expiry: number;
  refresh_token: string;
  udid: string;
};

declare type AppToken = {
  id: string;
  token: string;
  udid: string;
};

declare type ButtonImageProps = {
  imageSrc: string;
  style?: import("react-native").ImageStyle;
};

declare type FloatingButtonProps = {
  screenStyles: {
    top_button_font_ios: string;
    top_button_font_android: string;
    top_button_font_size: number;
    top_button_font_color: string;
    top_button_radius: number;
    top_button_border_color: string;
    top_button_border_size: number;
    top_button_background_color: string;
    top_button_type: string;
    top_button_image_close: string;
  },
  screenLocalizations: {
    close_button_text: string;
  },
  onClose: () => void;
}


  interface Window {
    alert: (message: string) => void;
  }