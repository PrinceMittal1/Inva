/**
 * @format
 */
import appsFlyer from 'react-native-appsflyer';
import {AppRegistry} from 'react-native';
import App from './App';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import {name as appName} from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message received:', remoteMessage);

  // optionally show a local notification using Notifee
  await notifee.displayNotification({
    title: remoteMessage.notification?.title ?? 'Background Message',
    body: remoteMessage.notification?.body ?? '',
    android: {
      channelId: 'default',
      smallIcon: 'ic_launcher',
    },
  });
});

    appsFlyer.initSdk(
      {
        devKey: "hf74naWswXcY83UHeUf467",
        isDebug: true,
        appId: "YOUR_IOS_APP_ID", // iOS only
      },
      (result) => { console.log("AppsFlyer init success:", result); },
      (error) => { console.error("AppsFlyer init error:", error); }
    );

AppRegistry.registerComponent(appName, () => App);
