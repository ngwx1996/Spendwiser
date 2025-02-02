import React from 'react';
import * as Sentry from 'sentry-expo';
import { initializeAppBackend } from './src/network/backend_setter';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoadingScreen } from './src/components/LoadingScreen';
import { Login } from './src/components/login/Login';
import { CreateAccount } from './src/components/login/CreateAccount';
import { Settings } from './src/components/settings/Settings';
import { YourCards } from './src/components/cards/YourCards';
import { DisplayCard } from './src/components/cards/DisplayCard';
import { MainScreen } from './src/components/main/MainScreen';
import { MainHelp } from './src/components/main/MainHelp';
import { AddCardManual } from './src/components/addCard/AddCardManual';
import { PasswordReset } from './src/components/login/PasswordReset';
import { AddCardDB } from './src/components/addCard/AddCardDB';
import { AppPermissions } from './src/components/settings/Permissions';
import { PrivacyPolicy } from './src/components/settings/PrivacyPolicy';
import { Account } from './src/components/settings/Account';
import { About } from './src/components/settings/About';
import { SpendingSummary } from './src/components/summary/SpendingSummary';
import { EditImage } from './src/components/addCard/fromCamera/EditImage';
import { ChooseImage } from './src/components/addCard/fromCamera/ChooseImage';
import { CardSelect } from './src/components/addCard/fromCamera/CardSelect';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createStackNavigator();

Sentry.init({
  dsn: "",
  enableInExpoDevelopment: true,
  debug: true, // Sentry will try to print out useful debugging information if something goes wrong with sending an event. Set this to `false` in production.
});

// reference: https://stackoverflow.com/questions/35309385/how-do-you-hide-the-warnings-in-react-native-ios-simulator
// Suppress warnings 
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications


/**
 * The app module utilized by React Native
 * @module App
 */
export default function App() {
  initializeAppBackend("firebase"); // utilize the Firebase backend in the app

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={
            {
              headerShown: false,
              swipeEnabled: false,
            }
          }
        >
          <Stack.Screen
            name="Home"
            component={LoadingScreen}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{animationEnabled: true, gestureEnabled: false}}
          />
          <Stack.Screen
            name="CreateAccount"
            component={CreateAccount}
          />
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{animationEnabled: false}}
          />
          <Stack.Screen
            name="MainHelp"
            component={MainHelp}
          />
          <Stack.Screen
            name="YourCards"
            component={YourCards}
            options={{animationEnabled: false}}
          />
          <Stack.Screen
            name="CardInfo"
            component={DisplayCard}
          />
          <Stack.Screen
            name="SpendingSummary"
            component={SpendingSummary}
            options={{animationEnabled: false}}
          />
          <Stack.Screen
          name="Settings"
          component={Settings}
          options={{animationEnabled: false}}
          />
          <Stack.Screen
            name="AddCardManual"
            component={AddCardManual}
          />
          <Stack.Screen
            name="EditImage"
            component={EditImage}
          />
          <Stack.Screen
            name="ChooseImage"
            component={ChooseImage}
          />
          <Stack.Screen
            name="CardSelect"
            component={CardSelect}
          />
          <Stack.Screen
            name="PasswordReset"
            component={PasswordReset}
          />
          <Stack.Screen
            name="AddCardDB"
            component={AddCardDB}
          />
          <Stack.Screen
            name="Permissions"
            component={AppPermissions}
          />
          <Stack.Screen
            name="PrivacyPolicy"
            component={PrivacyPolicy}
          />
          <Stack.Screen
            name="About"
            component={About}
          />
          <Stack.Screen
            name="Account"
            component={Account}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
