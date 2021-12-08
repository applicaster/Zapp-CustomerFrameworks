/// <reference types="@applicaster/applicaster-types" />
import { Login } from "./Components/Login";
import * as R from "ramda";

import { connectToStore } from "@applicaster/zapp-react-native-redux";

export default {
  isFlowBlocker: () => true,
  presentFullScreen: true,
  Component: connectToStore(R.pick(["rivers"]))(Login), // usePickFromState
};
