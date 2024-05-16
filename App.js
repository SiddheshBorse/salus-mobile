import React from 'react';
import { View } from 'react-native';
import QRCodeScanner from './components/QRcomponent';

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      <QRCodeScanner />
    </View>
  );
};

export default App;
