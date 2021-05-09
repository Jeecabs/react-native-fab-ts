import {
  Platform,
  TouchableOpacity,
  TouchableNativeFeedback,
  ColorValue,
  FlexAlignType,
} from "react-native";

// export const DEFAULT_ACTIVE_OPACITY: number = 0.85;

export const shadowStyle = {
  shadowOpacity: 0.35,
  shadowOffset: {
    width: 0,
    height: 5,
  },
  shadowColor: "#000",
  shadowRadius: 3,
  elevation: 5,
};

export const alignItemsMap: Record<string, FlexAlignType> = {
  center: "center",
  left: "flex-start",
  right: "flex-end",
};

export const isAndroid = Platform.OS === "android";



export function touchableBackground(color: ColorValue, fixRadius: boolean) {
  if (isAndroid) {
    if (Platform["Version"] >= 21) {
      return TouchableNativeFeedback.Ripple(
        color || "rgba(255,255,255,0.75)",
        fixRadius
      );
    } else {
      TouchableNativeFeedback.SelectableBackground();
    }
  }
  return undefined;
}
