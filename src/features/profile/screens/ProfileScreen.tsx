import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Modal from 'react-native-modal';
import ScreenContainer from '../../../shared/components/ScreenContainer';
import SurfaceCard from '../../../shared/components/SurfaceCard';
import { AuthUser, useAuthStore } from '../../../store/authStore';
import { colors, fontSizes, fontWeights, radius, spacing } from '../../../theme';


const IMAGE_KEY = 'profile_image';

function getFullName(user: AuthUser | null) {
  if (!user) return 'User';

  if (user.fullName?.trim()) return user.fullName.trim();

  const fallbackName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return fallbackName || 'User';
}

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const profileImage = useAuthStore((state) => state.profileImage);
  const setProfileImage = useAuthStore((state) => state.setProfileImage);

  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow gallery access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
    toggleModal();
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow camera access');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
    toggleModal();
  };

  const removePhoto = () => {
    setProfileImage(null);
    toggleModal();
  };

  const fullName = getFullName(user);

  const initials =
    fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'U';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ScreenContainer fullWidth style={styles.container}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather color="#24406D" name="arrow-left" size={18} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <SurfaceCard style={styles.profileCard}>
          
          {/* ✅ Avatar with Edit Icon */}
          <Pressable onPress={toggleModal}>
            <View style={{ position: 'relative', marginBottom: 14 }}>
              <View style={[styles.avatar, { marginBottom: 0 }]}>
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={{ width: 72, height: 72, borderRadius: 36 }}
                  />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
              </View>
              <View style={styles.editBadge}>
                <Feather name="camera" size={12} color="#fff" />
              </View>
            </View>
          </Pressable>

          <Text style={styles.nameText}>{fullName}</Text>
          <Text style={styles.emailText}>
            {user?.email || 'No email available'}
          </Text>

          <View style={styles.infoBlock}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>
                {user?.phone || 'Not added'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>
                {user?.gender || 'Not added'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>
                {user?.verified ? 'Verified' : 'Pending verification'}
              </Text>
            </View>
          </View>

          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </SurfaceCard>

        {/* ✅ Bottom Sheet for Image Options */}
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={toggleModal}
          onSwipeComplete={toggleModal}
          swipeDirection={['down']}
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Pressable style={styles.modalOption} onPress={pickFromLibrary}>
              <Ionicons name="images-outline" size={24} color={colors.text} />
              <Text style={styles.modalOptionText}>Upload picture</Text>
            </Pressable>

            <Pressable style={styles.modalOption} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color={colors.text} />
              <Text style={styles.modalOptionText}>Take photo</Text>
            </Pressable>

            <Pressable style={styles.modalOption} onPress={removePhoto}>
              <Ionicons name="trash-outline" size={24} color={colors.danger} />
              <Text style={[styles.modalOptionText, { color: colors.danger }]}>Remove picture</Text>
            </Pressable>
          </View>
        </Modal>

      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: colors.primaryDark,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
  },
  headerSpacer: {
    width: 40,
  },
  profileCard: {
    alignItems: 'center',
    padding: 22,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginBottom: 14,
    width: 72,
    overflow: 'hidden',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: fontWeights.bold,
  },
  nameText: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  emailText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  infoBlock: {
    backgroundColor: colors.backgroundMuted,
    borderRadius: 18,
    marginTop: 22,
    padding: 16,
    rowGap: 14,
    width: '100%',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  infoValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: fontWeights.semibold,
    maxWidth: '58%',
    textAlign: 'right',
  },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 14,
    marginTop: 24,
    paddingVertical: 14,
    width: '100%',
  },
  logoutText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  modalOptionText: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
});