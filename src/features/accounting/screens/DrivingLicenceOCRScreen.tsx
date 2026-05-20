import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  ListRenderItem,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';

// import * as FileSystem from 'expo-file-system';

import {
  writeAsStringAsync,
} from 'expo-file-system';

import * as Sharing from 'expo-sharing';

import { Ionicons } from '@expo/vector-icons';

import { useRouter } from 'expo-router';

import {
  scanDrivingLicence,
} from '../../../api/ocr.service';

import {
  saveDrivingLicence,
  getDrivingLicences,
  deleteDrivingLicence,
  clearDrivingLicences,
} from '../../../store/drivingLicenceStorage';



interface LicenceItem {
  id: string;
  fileName: string;
  createdAt: string;
  response: any;
}



const DrivingLicenceOCRScreen =
  () => {
    const router =
      useRouter();

    const [loading, setLoading] =
      useState<boolean>(false);

    const [licences, setLicences] =
      useState<LicenceItem[]>(
        []
      );



    useEffect(() => {
      loadLicences();
    }, []);



    const loadLicences =
      (): void => {
        const data =
          getDrivingLicences();

        setLicences(data);
      };



    const pickFile =
      async (): Promise<void> => {
        try {
          const result =
            await DocumentPicker.getDocumentAsync(
              {
                type: [
                  'application/pdf',
                  'image/*',
                ],
                copyToCacheDirectory:
                  true,
              }
            );

          if (result.canceled) {
            return;
          }

          const file =
            result.assets[0];

          setLoading(true);

          const response =
            await scanDrivingLicence(
              file
            );

          const data: LicenceItem =
            {
              id: Date.now().toString(),
              fileName:
                file.name,
              createdAt:
                new Date().toISOString(),
              response,
            };

          saveDrivingLicence(
            data
          );

          loadLicences();

          Alert.alert(
            'Success',
            'Driving Licence Processed Successfully'
          );
        } catch (error) {
          console.log(error);

          Alert.alert(
            'Error',
            'Driving Licence OCR Failed'
          );
        } finally {
          setLoading(false);
        }
      };



    const removeLicence =
      (
        id: string
      ): void => {
        deleteDrivingLicence(
          id
        );

        loadLicences();
      };



    const clearAll =
      (): void => {
        Alert.alert(
          'Clear All',
          'Delete all licences?',
          [
            {
              text: 'Cancel',
            },
            {
              text: 'Clear',
              style:
                'destructive',
              onPress:
                (): void => {
                  clearDrivingLicences();

                  loadLicences();
                },
            },
          ]
        );
      };



    const exportData =
      async (
        item: LicenceItem
      ) => {
        try {
          const fileUri =
                     `${window.location.origin}/${item.fileName}.json`;

          await writeAsStringAsync(
            fileUri,
            JSON.stringify(
              item.response,
              null,
              2
            )
          );

          await Sharing.shareAsync(
            fileUri
          );
        } catch (error) {
          console.log(error);

          Alert.alert(
            'Export Failed'
          );
        }
      };



    const renderItem: ListRenderItem<LicenceItem> =
      ({ item }) => {
        return (
          <View
            style={
              styles.card
            }
          >
            <Text
              style={
                styles.fileName
              }
            >
              {
                item.fileName
              }
            </Text>

            <Text
              style={
                styles.date
              }
            >
              {
                item.createdAt
              }
            </Text>

            <ScrollView
              style={
                styles.responseBox
              }
            >
              <Text
                style={
                  styles.responseText
                }
              >
                {JSON.stringify(
                  item.response,
                  null,
                  2
                )}
              </Text>
            </ScrollView>

            <View
              style={
                styles.buttonRow
              }
            >
              <TouchableOpacity
                style={
                  styles.exportButton
                }
                onPress={() =>
                  exportData(
                    item
                  )
                }
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Export
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.deleteButton
                }
                onPress={() =>
                  removeLicence(
                    item.id
                  )
                }
              >
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      };



    return (
      <View
        style={
          styles.container
        }
      >
        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            onPress={() =>
              router.push(
                '/accounting/more'
              )
            }
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>

          <Text
            style={
              styles.headerTitle
            }
          >
            Driving Licence Import
          </Text>
        </View>

        <View
          style={
            styles.uploadCard
          }
        >
          <Ionicons
            name="document-text-outline"
            size={60}
            color="#3b82f6"
          />

          <Text
            style={
              styles.title
            }
          >
            Upload Driving Licence
          </Text>

          <Text
            style={
              styles.subtitle
            }
          >
            Upload PDF or Image for OCR extraction.
          </Text>

          <TouchableOpacity
            style={
              styles.uploadButton
            }
            onPress={
              pickFile
            }
          >
            <Text
              style={
                styles.uploadButtonText
              }
            >
              {loading
                ? 'Uploading...'
                : 'Choose File'}
            </Text>
          </TouchableOpacity>
        </View>

        {licences.length >
          0 && (
          <TouchableOpacity
            style={
              styles.clearButton
            }
            onPress={
              clearAll
            }
          >
            <Text
              style={
                styles.buttonText
              }
            >
              Clear All
            </Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={licences}
          keyExtractor={(
            item
          ) => item.id}
          renderItem={
            renderItem
          }
          contentContainerStyle={{
            paddingBottom: 100,
          }}
        />
      </View>
    );
  };



export default
DrivingLicenceOCRScreen;



const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#f3f4f6',
    },

    header: {
      backgroundColor:
        '#2563eb',
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      gap: 14,
    },

    headerTitle: {
      color: '#fff',
      fontSize: 20,
      fontWeight:
        '700',
    },

    uploadCard: {
      backgroundColor:
        '#fff',
      margin: 20,
      borderRadius: 24,
      padding: 24,
      alignItems:
        'center',
    },

    title: {
      fontSize: 24,
      fontWeight:
        '700',
      color: '#111827',
      marginTop: 20,
    },

    subtitle: {
      color: '#6b7280',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 20,
    },

    uploadButton: {
      backgroundColor:
        '#3b82f6',
      paddingVertical: 16,
      borderRadius: 16,
      width: '100%',
    },

    uploadButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontWeight:
        '700',
    },

    clearButton: {
      backgroundColor:
        '#dc2626',
      marginHorizontal: 20,
      padding: 16,
      borderRadius: 14,
      marginBottom: 20,
    },

    card: {
      backgroundColor:
        '#fff',
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 20,
      padding: 20,
    },

    fileName: {
      fontSize: 16,
      fontWeight:
        '700',
      color: '#111827',
    },

    date: {
      color: '#6b7280',
      marginTop: 6,
      marginBottom: 16,
    },

    responseBox: {
      maxHeight: 300,
      backgroundColor:
        '#111827',
      borderRadius: 14,
      padding: 14,
    },

    responseText: {
      color: '#fff',
      fontSize: 12,
    },

    buttonRow: {
      flexDirection:
        'row',
      gap: 10,
      marginTop: 16,
    },

    exportButton: {
      flex: 1,
      backgroundColor:
        '#2563eb',
      padding: 14,
      borderRadius: 12,
    },

    deleteButton: {
      flex: 1,
      backgroundColor:
        '#dc2626',
      padding: 14,
      borderRadius: 12,
    },

    buttonText: {
      color: '#fff',
      textAlign: 'center',
      fontWeight:
        '700',
    },
  });