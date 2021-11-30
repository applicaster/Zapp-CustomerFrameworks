import { Alert } from "react-native";
import { isWebBasedPlatform } from "../Platform";

declare const window: Window

export function showAlert(title, message) {
  isWebBasedPlatform
    ? window.alert(`${title} \n${message}`)
    : Alert.alert(title, message);
}
