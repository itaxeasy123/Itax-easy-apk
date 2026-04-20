// import { ReactNode } from 'react';
// import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import { colors, layout, useResponsiveLayout } from '../../theme';

// type ScreenContainerProps = {
//   children: ReactNode;
//   style?: StyleProp<ViewStyle>;
// };

// export default function ScreenContainer({
//   children,
//   style,
// }: ScreenContainerProps) {
//   const { screenPadding } = useResponsiveLayout();

//   return (
//     <SafeAreaView edges={['top']} style={styles.safeArea}>
//       <View
//         style={[
//           styles.content,
//           {
//             paddingHorizontal: screenPadding,
//           },
//           style,
//         ]}
//       >
//         {children}
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     backgroundColor: colors.background,
//     flex: 1,
//   },
//   content: {
//     alignSelf: 'center',
//     backgroundColor: colors.background,
//     flex: 1,
//     maxWidth: layout.screenMaxWidth,
//     width: '100%',
//   },
// });

import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, layout, useResponsiveLayout } from '../../theme';

type ScreenContainerProps = {
  children: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function ScreenContainer({
  children,
  fullWidth = false,
  style,
}: ScreenContainerProps) {
  const { screenPadding } = useResponsiveLayout();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View
        style={[
          fullWidth ? styles.contentFullWidth : styles.content,
          {
            paddingHorizontal: screenPadding,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    backgroundColor: colors.background,
    flex: 1,
    maxWidth: layout.screenMaxWidth,
    width: '100%',
  },
  contentFullWidth: {
    alignSelf: 'stretch',
    backgroundColor: colors.background,
    flex: 1,
    width: '100%',
  },
});
