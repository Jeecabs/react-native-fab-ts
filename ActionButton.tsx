import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";
import ActionButtonItem from "./ActionButtonItem";
import {
  shadowStyle,
  alignItemsMap,
  isAndroid,
} from "./shared";
import { ActionButtonProperties } from "./index";

const ActionButton: React.FC<ActionButtonProperties> & { Item: typeof ActionButtonItem } = (props) => {
  const [, setResetToken] = useState(props.resetToken);
  const [active, setActive] = useState(props.active);
  const anim = useRef(new Animated.Value(props.active ? 1 : 0));
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      timeout.current && clearTimeout(timeout.current);
    }
  }, []);

  useEffect(() => {
    if (props.active) {
      Animated.spring(anim.current, { toValue: 1, useNativeDriver: true }).start();
      setActive(true);
      setResetToken(props.resetToken);
    } else {
      props.onReset && props.onReset();

      Animated.spring(anim.current, { toValue: 0, useNativeDriver: true }).start();
      timeout.current = setTimeout(() => {
        setActive(false);
        setResetToken(props.resetToken);
      }, 250);
    }
  }, [props.resetToken, props.active]);

  //////////////////////
  // STYLESHEET GETTERS
  //////////////////////

  const getOrientation = () => {
    return { alignItems: alignItemsMap[props.position] };
  };

  const getOffsetXY = () => {
    return {
      // paddingHorizontal: props.offsetX,
      paddingVertical: props.offsetY
    };
  };

  // TODO REMOVE THIS
  // const getOverlayStyles: RecursiveArray<ViewProps | Falsy | RegisteredStyle<ViewProps>> = () => {
  //   return [
  //     styles.overlay,
  //     {
  //       elevation: props.elevation,
  //       zIndex: props.zIndex,
  //       justifyContent:
  //         props.verticalOrientation === "up" ? "flex-end" : "flex-start"
  //     }
  //   ];
  // };

  const _renderMainButton = () => {
    const animatedViewStyle = {
      transform: [
        {
          scale: anim.current.interpolate({
            inputRange: [0, 1],
            outputRange: [1, props.outRangeScale]
          })
        },
        {
          rotate: anim.current.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", props.degrees + "deg"]
          })
        }
      ]
    };

    const wrapperStyle = {
      backgroundColor: anim.current.interpolate({
        inputRange: [0, 1],
        outputRange: [props.buttonColor, props.btnOutRange || props.buttonColor]
      }),
      width: props.size,
      height: props.size,
      borderRadius: props.size / 2
    };


    // const Touchable = getTouchableComponent(props.useNativeFeedback);
    const parentStyle =
      isAndroid && props.fixNativeFeedbackRadius
        ? {
          right: props.offsetX,
          zIndex: props.zIndex,
          borderRadius: props.size / 2,
          width: props.size
        }
        : { marginHorizontal: props.offsetX, zIndex: props.zIndex };

    return (
      <View
        style={[
          parentStyle,
          !props.hideShadow && shadowStyle,
          !props.hideShadow && props.shadowStyle
        ]}
      >
        <TouchableOpacity
          testID={props.testID}
          accessible={props.accessible}
          accessibilityLabel={props.accessibilityLabel}
          // background={touchableBackground(
          //   props.nativeFeedbackRippleColor,
          //   props.fixNativeFeedbackRadius
          // )}
          activeOpacity={props.activeOpacity}
          onLongPress={props.onLongPress}
          onPress={() => {
            props.onPress();
            if (props.children) animateButton();
          }}
          onPressIn={props.onPressIn}
          onPressOut={props.onPressOut}
        >
          <Animated.View style={wrapperStyle}>
            <Animated.View style={[{
              width: props.size,
              height: props.size,
              borderRadius: props.size / 2,
              alignItems: "center",
              justifyContent: "center"
            }, animatedViewStyle]}>
              {_renderButtonIcon()}
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const _renderButtonIcon = () => {

    if (props.renderIcon) return props.renderIcon(props.active);


    const textColor: string = props.buttonTextStyle.color?.toString() ?? "rgba(255,255,255,1)";

    return (
      <Animated.Text
        style={[
          styles.btnText,
          props.buttonTextStyle,
          {
            color: anim.current.interpolate({
              inputRange: [0, 1],
              outputRange: [textColor, props.btnOutRangeTxt || textColor]
            })
          }
        ]}
      >
        {props.buttonText}
      </Animated.Text>
    );
  };


  // TODO SOLVE
  //const _renderActions = () => {
  //
  //  if (!active) return null;
  //
  //  let actionButtons = !Array.isArray(props.children) ? [props.children] : props.children;
  //
  //  actionButtons = actionButtons.filter(
  //    actionButton => typeof actionButton == "object"
  //  );
  //
  //
  //  return (
  //    <View style={{
  //      flex: 1,
  //      alignSelf: "stretch",
  //      // backgroundColor: 'purple',
  //      justifyContent: props.verticalOrientation === "up" ? "flex-end" : "flex-start",
  //      paddingTop: props.verticalOrientation === "down" ? props.spacing : 0,
  //      zIndex: props.zIndex
  //    }} pointerEvents={"box-none"}>
  //      {actionButtons.map((ActionButton, idx) => (
  //        <ActionButtonItem
  //          key={idx}
  //          anim={anim.current}
  //          {...props}
  //          {...ActionButton?.props}
  //          parentSize={props.size}
  //          btnColor={props.btnOutRange}
  //          onPress={() => {
  //            if (props.autoInactive) {
  //              timeout.current = setTimeout(reset, 200);
  //            }
  //            ActionButton?.props.onPress();
  //          }}
  //        />
  //      ))}
  //    </View>
  //  );
  //};

  const _renderTappableBackground = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={[
          styles.overlay,
          {
            elevation: props.elevation,
            zIndex: props.zIndex,
            justifyContent:
              props.verticalOrientation === "up" ? "flex-end" : "flex-start"
          }
        ]}
        onPress={() => reset}
      />
    );
  };

  //////////////////////
  // Animation Methods
  //////////////////////

  const animateButton = (animate = true) => {
    if (active) return reset(animate);

    if (animate) {
      Animated.spring(anim.current, { toValue: 1, useNativeDriver: true }).start();
    } else {
      anim.current.setValue(1);
    }

    setActive(true);
  };

  const reset = (animate = true) => {
    if (props.onReset) props.onReset();

    if (animate) {
      Animated.spring(anim.current, { toValue: 0, useNativeDriver: true }).start();
    } else {
      anim.current.setValue(0);
    }

    timeout.current = setTimeout(() => {
      if (mounted.current) {
        setActive(false);
      }
    }, 250);
  };

  return (
    <View pointerEvents="box-none" style={[[
      styles.overlay,
      {
        elevation: props.elevation,
        zIndex: props.zIndex,
        justifyContent:
          props.verticalOrientation === "up" ? "flex-end" : "flex-start"
      }
    ], props.style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          [
            styles.overlay,
            {
              elevation: props.elevation,
              zIndex: props.zIndex,
              justifyContent:
                props.verticalOrientation === "up" ? "flex-end" : "flex-start"
            }
          ],
          {
            backgroundColor: props.bgColor,
            opacity: anim.current.interpolate({
              inputRange: [0, 1],
              outputRange: [0, props.bgOpacity]
            })
          }
        ]}
      >
        {props.backdrop}
      </Animated.View>
      <View
        pointerEvents="box-none"
        style={[[
          styles.overlay,
          {
            elevation: props.elevation,
            zIndex: props.zIndex,
            justifyContent:
              props.verticalOrientation === "up" ? "flex-end" : "flex-start"
          }
        ], getOrientation(), getOffsetXY()]}
      >
        {active && !props.backgroundTappable && _renderTappableBackground()}

        {props.verticalOrientation === "up" &&
          props.children /*&&
          _renderActions()*/}
        {_renderMainButton()}
        {props.verticalOrientation === "down" &&
          props.children /*&&
        _renderActions()*/}
      </View>
    </View>
  );
};
ActionButton.Item = ActionButtonItem;



ActionButton.defaultProps = {
  resetToken: null,
  active: false,
  bgColor: "transparent",
  bgOpacity: 1,
  buttonColor: "rgba(0,0,0,1)",
  buttonTextStyle: {},
  buttonText: "+",
  spacing: 20,
  outRangeScale: 1,
  autoInactive: true,
  onPress: () => { },
  onPressIn: () => { },
  onPressOn: () => { },
  backdrop: false,
  degrees: 45,
  position: "right",
  offsetX: 30,
  offsetY: 30,
  size: 56,
  verticalOrientation: "up",
  backgroundTappable: false,
  useNativeFeedback: true,
  activeOpacity: DEFAULT_ACTIVE_OPACITY,
  fixNativeFeedbackRadius: false,
  nativeFeedbackRippleColor: "rgba(255,255,255,0.75)",
  testID: undefined,
  accessibilityLabel: undefined,
  accessible: undefined
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "transparent"
  },
  btnText: {
    marginTop: -4,
    fontSize: 24,
    backgroundColor: "transparent"
  }
});


export default ActionButton;
