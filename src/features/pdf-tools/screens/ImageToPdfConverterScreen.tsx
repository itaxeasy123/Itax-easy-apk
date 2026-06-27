import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import PdfToolLayout from '../components/PdfToolLayout';

function buildPdfHtml(imageTags: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page {
            margin: 18px;
          }

          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }

          .page {
            page-break-after: always;
            width: 100%;
          }

          .page:last-child {
            page-break-after: auto;
          }

          img {
            display: block;
            height: auto;
            width: 100%;
          }
        </style>
      </head>
      <body>
        ${imageTags}
      </body>
    </html>
  `;
}

function printHtmlOnWeb(html: string) {
  if (typeof window === 'undefined') {
    throw new Error('Printing is only available in the browser.');
  }

  const printWindow = window.open('', '_blank', 'width=900,height=700');

  if (!printWindow) {
    throw new Error('Unable to open the print window.');
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

export default function ImageToPdfConverterScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setMessage('Permission required');
      Alert.alert('Permission required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMessage('');
      setImages(result.assets.map((asset) => asset.uri));
    }
  };

  const createPDF = async () => {
    if (images.length === 0) {
      setMessage('Select at least one image');
      Alert.alert('Select at least one image');
      return;
    }

    try {
      setLoading(true);

      let imageTags = '';

      for (const img of images) {
        let dataUrl = '';

        if (Platform.OS !== 'web') {
          const base64 = await FileSystem.readAsStringAsync(img, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const ext = img.toLowerCase().endsWith('.png') ? 'png' : 'jpeg';
          dataUrl = `data:image/${ext};base64,${base64}`;
        } else {
          const response = await fetch(img);
          const blob = await response.blob();

          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }

        imageTags += `
          <div class="page">
            <img src="${dataUrl}" />
          </div>
        `;
      }

      const html = buildPdfHtml(imageTags);

      if (Platform.OS === 'web') {
        printHtmlOnWeb(html);
        setMessage('PDF opened in print preview successfully.');
        return;
      }

      const { uri } = await Print.printToFileAsync({ html });

      setMessage('PDF created successfully.');
      Alert.alert('PDF Created');

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      console.log(error);
      setMessage('Error creating PDF');
      Alert.alert('Error creating PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PdfToolLayout
      message={message}
      messageTone={message.toLowerCase().includes('success') || message.toLowerCase().includes('preview')
        ? 'success'
        : 'error'}
      summaryItems={[
        { label: 'Selected Images', value: String(images.length) },
        { label: 'Output', value: images.length ? 'PDF Ready' : 'Waiting' },
      ]}
      title="Image to PDF Converter"
    >
      <Pressable
        onPress={pickImages}
        style={{
          backgroundColor: '#347BE5',
          borderRadius: 8,
          padding: 14,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          Select Images
        </Text>
      </Pressable>

      <TextInput
        onChangeText={setFileName}
        placeholder="Enter PDF name (optional)"
        style={{
          borderColor: '#ccc',
          borderRadius: 8,
          borderWidth: 1,
          marginTop: 15,
          padding: 10,
        }}
        value={fileName}
      />

      <View style={{ marginTop: 15 }}>
        {images.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img }}
            style={{
              borderRadius: 10,
              height: 200,
              marginBottom: 10,
              width: '100%',
            }}
          />
        ))}
      </View>

      <Pressable
        disabled={loading}
        onPress={createPDF}
        style={{
          backgroundColor: loading ? '#999' : '#16A34A',
          borderRadius: 8,
          marginTop: 10,
          padding: 14,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', textAlign: 'center' }}>
            Convert to PDF
          </Text>
        )}
      </Pressable>
    </PdfToolLayout>
  );
}
