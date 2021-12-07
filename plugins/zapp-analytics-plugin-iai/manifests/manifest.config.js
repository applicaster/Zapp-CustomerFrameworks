const baseManifest = {
  api: {},
  dependency_repository_url: [],
  dependency_name: "@applicaster/zapp_analytics_plugin_iai",
  author_name: "Applicaster",
  author_email: "zapp@applicaster.com",
  name: "IAI Analytics Plugin",
  description: "IAI Analytics Plugin",
  type: "general",
  screen: true,
  react_native: true,
  identifier: "zapp_analytics_plugin_iai",
  ui_builder_support: true,
  whitelisted_account_ids: [],
  deprecated_since_zapp_sdk: "",
  unsupported_since_zapp_sdk: "",
  preload: true,
  ui_frameworks: ["quickbrick"],
};

const min_zapp_sdk = {
  ios_for_quickbrick: "5.5.0-Dev",
  android_for_quickbrick: "3.0.0-dev",
};

const withFallback = (obj, platform) => obj[platform] || obj["default"];

function createManifest({ version, platform }) {
  const custom_configuration_fields = [
    {
      type: "text_input",
      key: "service_url",
      label: "Service POST URL",
      initial_value: "https://iaimobile-weareiai.azurewebsites.net/api/SaveVersion?code=JtWROrjDkvnfOWsYiw/q4tciwfiFdcJV1fmzgF/Ix2KYLIALwF4yNw==",
    },
    {
      type: "text_input",
      key: "firebase_user_token_namespace",
      label: "Firebase User Token Namespace",
      initial_value: "ZappPushPluginFirebase",
    },
    {
      type: "text_input",
      key: "firebase_user_token_key",
      label: "Firebase User Token Key",
      initial_value: "FirebasePushToken",
    },
    {
      type: "text_input",
      key: "access_token_namespace",
      label: "Access Token Namespace",
      initial_value: "zapp_login_plugin_oauth_2_0",
    },
    {
      type: "text_input",
      key: "access_token_key",
      label: "access_token",
    }
  ];

  return {
    ...baseManifest,
    platform,
    dependency_version: version,
    manifest_version: version,
    min_zapp_sdk: withFallback(min_zapp_sdk, platform),
    custom_configuration_fields,
    targets: ["mobile"],
  };
}

module.exports = createManifest;
