import { Platform } from "react-native";

export const isWebBasedPlatform = Platform.OS === "web";

export const isApplePlatform = Platform.OS === "ios";

export const isAndroidPlatform = Platform.OS === "android";
