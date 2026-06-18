// import { CameraView, useCameraPermissions } from "expo-camera";
// import { View, Text, Pressable, StyleSheet } from "react-native";
// import { useRef } from "react";
// import { SafeAreaView } from "react-native-safe-area-context";

// export default function PanCamera({ onCapture }: any) {
//   const [permission, requestPermission] = useCameraPermissions();
//   const cameraRef = useRef<any>(null);

//   // 🚨 Permission not loaded
//   if (!permission) return null;

//   // ❌ Permission denied UI
//   if (!permission.granted) {
//     return (
//       <SafeAreaView style={styles.permissionContainer}>
//         <View style={styles.permissionBox}>
//           <Text style={styles.permissionTitle}>
//             Camera Permission Required
//           </Text>

//           <Text style={styles.permissionSub}>
//             Please allow camera access to scan PAN card
//           </Text>

//           <Pressable style={styles.allowBtn} onPress={requestPermission}>
//             <Text style={styles.btnText}>Allow Camera</Text>
//           </Pressable>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // 📸 Capture
//   const capture = async () => {
//     const photo = await cameraRef.current.takePictureAsync();
//     onCapture(photo);
//   };

//   return (
//     <View style={{ flex: 1 }}>
//       <CameraView ref={cameraRef} style={{ flex: 1 }} />

//       {/* 🔘 Capture Button */}
//       <Pressable style={styles.captureBtn} onPress={capture}>
//         <Text style={styles.btnText}>Capture</Text>
//       </Pressable>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   permissionContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F1F5F9",
//     padding: 20,
//   },
//   permissionBox: {
//     backgroundColor: "#fff",
//     padding: 20,
//     borderRadius: 16,
//     alignItems: "center",
//     elevation: 4,
//   },
//   permissionTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     marginBottom: 6,
//   },
//   permissionSub: {
//     fontSize: 12,
//     color: "#64748B",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   allowBtn: {
//     backgroundColor: "#2563EB",
//     padding: 12,
//     borderRadius: 10,
//   },
//   btnText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   captureBtn: {
//     position: "absolute",
//     bottom: 40,
//     alignSelf: "center",
//     backgroundColor: "#16A34A",
//     padding: 16,
//     borderRadius: 50,
//   },
// });

import { CameraView, useCameraPermissions } from "expo-camera";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PanCamera({ onCapture }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  // 🔄 Permission loading
  if (!permission) {
    return (
      <View style={styles.loader}>
        <Text>Loading Camera...</Text>
      </View>
    );
  }

  // ❌ Permission denied UI
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>
            Camera Permission Required
          </Text>

          <Text style={styles.permissionSub}>
            Please allow camera access to scan document
          </Text>

          <Pressable style={styles.allowBtn} onPress={requestPermission}>
            <Text style={styles.btnText}>Allow Camera</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // 📸 Capture image
  const capture = async () => {
    try {
      if (!cameraRef.current) return;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        skipProcessing: true,
      });

      onCapture(photo);
    } catch (error) {
      console.log("Camera Error:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* CAMERA VIEW */}
      <CameraView ref={cameraRef} style={{ flex: 1 }} />

      {/* CAPTURE BUTTON */}
      <Pressable style={styles.captureBtn} onPress={capture}>
        <Text style={styles.btnText}>Capture</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 20,
  },

  permissionBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
    width: "100%",
  },

  permissionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  permissionSub: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
    textAlign: "center",
  },

  allowBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  captureBtn: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#16A34A",
    padding: 18,
    borderRadius: 50,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});