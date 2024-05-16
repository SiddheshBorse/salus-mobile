import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Dimensions , ScrollView} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebase/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const QRCodeScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [qrData, setQRData] = useState(null);
  const [personnelData, setPersonnelData] = useState(null);
  const { width, height } = Dimensions.get('window');
  const [cameraHeight, setCameraHeight] = useState(height * 0.6);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    let parsedData;
  
    try {
      parsedData = JSON.parse(data);
      setQRData(parsedData);
    } catch (error) {
      console.error('Error parsing QR code data:', error);
      alert(`Invalid QR code data: ${data}`);
      return;
    }
  
    if (parsedData.key === 'bbldrizzy') {
      try {
        const hospitalUID = parsedData.hospitalUID; // Updated property name
        const uid = parsedData.uid;
        const personnelDocRef = doc(db, 'Hospitals', hospitalUID, 'personnel', uid);
        const personnelDocSnapshot = await getDoc(personnelDocRef);
  
        if (personnelDocSnapshot.exists()) {
            const personnelData = personnelDocSnapshot.data();
            setPersonnelData(personnelData);
          
            let clock = personnelData.clock || [];
          
            const lastClock = clock[clock.length - 1];
            const currentDateAndTime = new Date().toISOString();
          
            if (lastClock && !lastClock.clockout) {
              // Update the last clock-out time
              const updatedClock = { ...lastClock, clockout: currentDateAndTime };
              const updatedClockArray = [...clock.slice(0, -1), updatedClock];
              await updateDoc(personnelDocRef, { clock: updatedClockArray });
            } else {
              // Push new clock-in entry
              const newClockEntry = { clockin: currentDateAndTime, clockout: null };
              const updatedClockArray = [...clock, newClockEntry];
              await updateDoc(personnelDocRef, { clock: updatedClockArray });
            }
          
            alert(`Bar code with type ${type} and data ${JSON.stringify(personnelData)} has been scanned!`);
          } else {
            console.log('No personnel document found');
          }
          
      } catch (error) {
        console.error('Error fetching personnel document:', error);
      }
    }
  
    console.log(qrData);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (hasPermission === null) {
    return <Text style={styles.text}>Requesting for camera permission</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.text}>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          type={Camera.Constants.Type.back}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
          }}
        />
      </View>
      <View style={styles.detailsContainer}>
        {scanned && (
          <Button
            title="Re-Capture QR Code"
            onPress={() => setScanned(false)}
            color="#841584"
          />
        )}
        {qrData && (
          <Text style={styles.qrData}>
            {JSON.stringify(qrData, null, 2)}
          </Text>
        )}
        {personnelData && (
          <View style={styles.personnelDataContainer}>
            <Text style={styles.personnelDataText}>Personnel Data:</Text>
            <Text style={styles.personnelDataText}>
              {JSON.stringify(personnelData, null, 2)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cameraContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  camera: {
    width: '80%',
    height: '80%',
    borderWidth: 2,
    borderColor: 'white',
  },
  detailsContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  qrData: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#841584',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  personnelDataContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  personnelDataText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default QRCodeScanner;
