import React, { useState, useEffect } from "react";
import { 
  Pressable, 
  StyleSheet, 
  Text, 
  ActivityIndicator, 
  View, 
  Animated 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { itrColors, itrRadius, itrShadows } from "../../../theme/itr";

type ITRSaveButtonProps = {
  onPress: () => void;
  title?: string;
  loading?: boolean;
  successDuration?: number;
  disableSuccessState?: boolean;
};

const ITRSaveButton = ({ 
  onPress, 
  title = "Save Details", 
  successDuration = 2000,
  disableSuccessState = false,
}: ITRSaveButtonProps) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const scaleAnim = new Animated.Value(1);

  const handlePress = async () => {
    if (status !== "idle") return;

    // Start loading
    setStatus("loading");
    
    // Simulate slight delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 600));

    // Call the original onPress
    try {
      await onPress();
      if (disableSuccessState) {
        setStatus("idle");
      } else {
        setStatus("success");
      }
    } catch (error) {
      setStatus("idle");
    }
  };

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, successDuration);
      return () => clearTimeout(timer);
    }
  }, [status, successDuration]);

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.button,
          status === "success" && styles.successButton,
          status === "loading" && styles.loadingButton,
        ]}
      >
        {status === "loading" ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : status === "success" ? (
          <View style={styles.content}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Saved Successfully!</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: itrColors.primary,
    borderRadius: itrRadius.md,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    ...itrShadows.floating,
  },
  loadingButton: {
    opacity: 0.8,
  },
  successButton: {
    backgroundColor: "#10B981", // Emerald green
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ITRSaveButton;
