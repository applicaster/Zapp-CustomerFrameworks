/// <reference types="@applicaster/applicaster-types" />
import { Analytics, shouldSkipHook } from "./components/Analytics";

export default {
  isFlowBlocker: () => true,
  presentFullScreen: true,
  skipHook: () => shouldSkipHook(),
  Component: Analytics,
};
