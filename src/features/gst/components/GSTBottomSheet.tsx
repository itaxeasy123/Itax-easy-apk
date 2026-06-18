import React, {
  forwardRef,
  useMemo,
} from "react";

import BottomSheet from "@gorhom/bottom-sheet";

import GSTDashboardScreen from "../screens/GSTDashboardScreen";

const GSTBottomSheet = forwardRef<any>((props, ref) => {
  const snapPoints = useMemo(() => ["88%"], []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
    >
      <GSTDashboardScreen />
    </BottomSheet>
  );
});

GSTBottomSheet.displayName = "GSTBottomSheet";

export default GSTBottomSheet;