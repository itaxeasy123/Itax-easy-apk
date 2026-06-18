// import { TouchableOpacity, Text } from "react-native";

// export default function Button({ title, onPress }: any) {
//   return (
//     <TouchableOpacity
//       onPress={onPress}
//       style={{
//         backgroundColor: "#3B82F6",
//         padding: 14,
//         borderRadius: 10,
//         marginTop: 10,
//       }}
//     >
//       <Text style={{ color: "#fff", textAlign: "center" }}>
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );
// }

import { TouchableOpacity, Text } from "react-native";

export default function Button({ title, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: "#347BE5",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "600" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}