import '@react-native-firebase/app';
import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { Provider } from "react-redux";
import MainStack from './Source/Navigation/Stack';
import { NavigationContainer } from '@react-navigation/native';
import { store, persistor } from './Source/Redux/store';
import { PersistGate } from "redux-persist/integration/react";

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
