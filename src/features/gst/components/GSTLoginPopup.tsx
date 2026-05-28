import React, {
  useEffect,
  useState,
} from "react";

import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useGSTLoginStore,
} from "../store/gstLoginStore";

interface Props {
  visible: boolean;

  onClose: () => void;

  onLogin?: () => void;
}

export default function GSTLoginPopup({
  visible,
  onClose,
  onLogin,
}: Props) {
  /*
  |--------------------------------------------------------------------------
  | STORE
  |--------------------------------------------------------------------------
  */

  const {
    loginData,
    setLoginData,
  } =
    useGSTLoginStore();

  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [gstin, setGSTIN] =
    useState("");

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    manageApiSession,
    setManageApiSession,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD STORED DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setGSTIN(
      loginData.gstin
    );

    setUsername(
      loginData.username
    );

    setPassword(
      loginData.password
    );

    setManageApiSession(
      loginData.manageApiSession
    );
  }, [visible]);

  /*
  |--------------------------------------------------------------------------
  | LOGIN HANDLER
  |--------------------------------------------------------------------------
  */

  const handleLogin = () => {
    setLoginData({
      gstin,
      username,
      password,
      manageApiSession,
    });

    onLogin?.();

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View
        style={
          styles.overlay
        }
      >
        <View
          style={
            styles.popup
          }
        >
          {/* CLOSE */}

          <TouchableOpacity
            style={
              styles.closeButton
            }
            onPress={onClose}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color="#444"
            />
          </TouchableOpacity>

          {/* TITLE */}

          <Text
            style={
              styles.title
            }
          >
            Enter all Details
          </Text>

          {/* GSTIN */}

          <TextInput
            value={gstin}
            onChangeText={
              setGSTIN
            }
            placeholder="GSTIN"
            placeholderTextColor="#9CA3AF"
            style={
              styles.input
            }
            autoCapitalize="characters"
          />

          {/* USERNAME */}

          <TextInput
            value={username}
            onChangeText={
              setUsername
            }
            placeholder="Username"
            placeholderTextColor="#9CA3AF"
            style={
              styles.input
            }
          />

          {/* SESSION BUTTON */}

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.sessionButton,

              manageApiSession &&
                styles.activeSessionButton,
            ]}
            onPress={() =>
              setManageApiSession(
                !manageApiSession
              )
            }
          >
            <Text
              style={
                styles.sessionButtonText
              }
            >
              Manage API Session
            </Text>
          </TouchableOpacity>

          {/* USERNAME */}

          <TextInput
            value={username}
            onChangeText={
              setUsername
            }
            placeholder="Username"
            placeholderTextColor="#9CA3AF"
            style={
              styles.input
            }
          />

          {/* PASSWORD */}

          <TextInput
            value={password}
            onChangeText={
              setPassword
            }
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            style={
              styles.input
            }
            secureTextEntry
          />

          {/* LOGIN BUTTON */}

          <TouchableOpacity
            activeOpacity={0.9}
            style={
              styles.loginButton
            }
            onPress={
              handleLogin
            }
          >
            <Text
              style={
                styles.loginButtonText
              }
            >
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.25)",
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },

    popup: {
      width: "100%",
      maxWidth: 320,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 22,
      paddingHorizontal: 14,
      paddingVertical: 18,
      position: "relative",
    },

    closeButton: {
      position: "absolute",
      top: 12,
      right: 12,
      zIndex: 999,
    },

    title: {
      textAlign: "center",
      fontSize: 13,
      fontWeight: "500",
      color: "#333333",
      marginTop: 12,
      marginBottom: 14,
    },

    input: {
      height: 42,
      borderWidth: 1,
      borderColor: "#D1D5DB",
      borderRadius: 8,
      paddingHorizontal: 10,
      fontSize: 12,
      fontWeight: "500",
      color: "#111827",
      marginBottom: 12,
      backgroundColor:
        "#FFFFFF",
    },

    sessionButton: {
      height: 36,
      backgroundColor:
        "#3D7BEA",
      borderRadius: 10,
      alignItems: "center",
      justifyContent:
        "center",
      alignSelf: "center",
      paddingHorizontal: 16,
      marginBottom: 12,
    },

    activeSessionButton: {
      backgroundColor:
        "#2563EB",
    },

    sessionButtonText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
    },

    loginButton: {
      height: 40,
      backgroundColor:
        "#3D7BEA",
      borderRadius: 10,
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 4,
    },

    loginButtonText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },
  });