import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Pressable,
} from "react-native";
import { shadowStyle, alignItemsMap, isAndroid } from "./shared";
import { ActionButtonItemProperties } from "./index";

const { width: WIDTH } = Dimensions.get("window");
const SHADOW_SPACE = 10;
const TEXT_HEIGHT = 22;

const ActionButtonItem: React.FC<ActionButtonItemProperties> = (props) => {
  if (!props.active) return null;

  const animatedViewStyle = {
    marginBottom: -SHADOW_SPACE,
    alignItems: alignItemsMap[props.position],

    // backgroundColor: props.buttonColor,
    opacity: props.anim,
    transform: [
      {
        translateY: props.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [props.verticalOrientation === "down" ? -40 : 40, 0],
        }),
      },
    ],
  };

  const buttonStyle: { [key: string]: any } = {
    justifyContent: "center",
    alignItems: "center",
    width: props.size,
    height: props.size,
    borderRadius: props.size / 2,
    backgroundColor: props.buttonColor || props.btnColor,
  };

  if (props.position !== "center")
    buttonStyle[props.position] = (props.parentSize - props.size) / 2;

  const parentStyle =
    isAndroid && props.fixNativeFeedbackRadius
      ? {
          height: props.size,
          marginBottom: props.spacing,
          right: props.offsetX,
          borderRadius: props.size / 2,
        }
      : {
          paddingHorizontal: props.offsetX,
          height: props.size + SHADOW_SPACE + props.spacing,
        };

  const _renderTitle = () => {
    if (!props.title) return null;

    const offsetTop = Math.max(props.size / 2 - TEXT_HEIGHT / 2, 0);
    const positionStyles: { [key: string]: any } = { top: offsetTop };
    const hideShadow =
      props.hideLabelShadow === undefined
        ? props.hideShadow
        : props.hideLabelShadow;

    if (props.position !== "center") {
      positionStyles[props.position] =
        props.offsetX +
        (props.parentSize - props.size) / 2 +
        props.size +
        props.spaceBetween;
    } else {
      positionStyles.right = WIDTH / 2 + props.size / 2 + props.spaceBetween;
    }

    const textStyles = [
      styles.textContainer,
      positionStyles,
      !hideShadow && shadowStyle,
      props.textContainerStyle,
    ];

    const title = React.isValidElement(props.title) ? (
      props.title
    ) : (
      <Text
        allowFontScaling={false}
        style={[styles.text, props.textStyle]}
        numberOfLines={props.numberOfLines}
      >
        {props.title}
      </Text>
    );

    return (
      <Pressable onPress={props.onPress}>
        <View style={textStyles}>{title}</View>
      </Pressable>
    );
  };
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[animatedViewStyle, parentStyle]}
    >
      <View>
        <Pressable
          testID={props.testID}
          accessibilityLabel={props.accessibilityLabel}
          onPress={props.onPress}
        >
          <View
            style={[
              props.buttonStyle,
              !props.hideShadow
                ? { ...shadowStyle, ...props.shadowStyle }
                : null,
            ]}
          >
            {props.children}
          </View>
        </Pressable>
      </View>
      {_renderTitle()}
    </Animated.View>
  );
};

ActionButtonItem.defaultProps = {
  active: true,
  spaceBetween: 15,
  useNativeFeedback: true,
  fixNativeFeedbackRadius: false,
  nativeFeedbackRippleColor: "rgba(255,255,255,0.75)",
  numberOfLines: 1,
};
const styles = StyleSheet.create({
  textContainer: {
    position: "absolute",
    paddingVertical: isAndroid ? 2 : 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    backgroundColor: "white",
    height: TEXT_HEIGHT,
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: "#444",
  },
});
export default ActionButtonItem;
