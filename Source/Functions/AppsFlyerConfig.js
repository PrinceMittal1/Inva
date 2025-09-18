import appsFlyer from 'react-native-appsflyer';

const APPSFLYER_DEV_KEY = 'YOUR_APPSFLYER_DEV_KEY';
const APPSFLYER_APP_ID = 'YOUR_APP_ID_IOS'; // Only for iOS

// Initialize AppsFlyer
export const initAppsFlyer = () => {
  appsFlyer.initSdk(
    {
      devKey: 'hf74naWswXcY83UHeUf467',
      isDebug: false,
      appId: APPSFLYER_APP_ID, // iOS only
      onInstallConversionDataListener: true, // Optional for deferred deep linking
      onDeepLinkListener: true, // Optional for deep linking
      timeToWaitForATTUserAuthorization: 10 // iOS only
    },
    (result) => {
      console.log('AppsFlyer SDK initialized successfully', result);
    },
    (error) => {
      console.error('Error initializing AppsFlyer SDK', error);
    }
  );
};

// Set up deep link listeners
export const setupDeepLinkListeners = (navigation) => {
  // Listen for install conversion data (deferred deep linking)
  appsFlyer.onInstallConversionData((res) => {
    if (res.data?.af_status === 'Non-organic') {
      if (res.data.media_source) {
        console.log('Campaign: ', res.data);
        handleDeepLinkData(res.data, navigation, true);
      }
    }
  });

  // Listen for deep links (direct deep linking)
  appsFlyer.onDeepLink((res) => {
    console.log('Deep link received: ', res);
    if (res.deepLinkStatus === 'FOUND') {
      handleDeepLinkData(res.data, navigation, false);
    }
  });
};

// Handle deep link data and navigate accordingly
const handleDeepLinkData = (data, navigation, isDeferred) => {
  console.log('Handling deep link data:', data);
  
  // Extract parameters from deep link
  const productId = data.product_id || data.pid;
  const category = data.category || data.cat;
  const campaign = data.campaign || data.c;
  
  if (productId) {
    // Navigate to product screen
    navigation.navigate('Product', { 
      productId,
      isFromDeepLink: true,
      isDeferred
    });
  } else if (category) {
    // Navigate to category screen
    navigation.navigate('Category', { 
      category,
      isFromDeepLink: true,
      isDeferred
    });
  } else if (campaign) {
    // Navigate to campaign screen
    navigation.navigate('Campaign', { 
      campaign,
      isFromDeepLink: true,
      isDeferred
    });
  }
  
  // Log the deep link event
  appsFlyer.logEvent('deep_link_opened', data);
};

// Generate OneLink URL
export const generateOneLinkURL = (deepLinkPath, params) => {
  const baseURL = 'https://onelink-basic-app.onelink.me';
  const queryParams = new URLSearchParams(params).toString();
  return `${baseURL}/${deepLinkPath}${queryParams ? `?${queryParams}` : ''}`;
};

export default appsFlyer;