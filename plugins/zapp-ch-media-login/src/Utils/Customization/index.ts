import { platformSelect } from "@applicaster/zapp-react-native-utils/reactUtils";
import { populateConfigurationValues } from "@applicaster/zapp-react-native-utils/stylesUtils";

const ios = require("../../../manifests/ios_for_quickbrick.json");
const android = require("../../../manifests/android_for_quickbrick.json");

const manifestJson = () => {
  try {
    return platformSelect({
      ios,
      android,
    });
  } catch (error) {
    throw new Error(`Could not load manifest at cleeng login plugin: ${error}`);
  }
};

export function pluginIdentifier() {
  return manifestJson().identifier;
}

export function prepareStyles(screenStyles) {
  const styles = populateConfigurationValues(manifestJson().styles.fields)(
    screenStyles
  );

  return styles;
}

export function getStyles(screenStyles) {
  return prepareStyles(screenStyles);
}
