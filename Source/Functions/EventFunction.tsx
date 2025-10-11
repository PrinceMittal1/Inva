import analytics from '@react-native-firebase/analytics';

type AnalyticsParams = {
  event_category?: string;
  event_label?: string;
  event_action?: string;
  user_id?: string;
  seller_name?:string;
  seller_id?:string;
  user_pincode?: string;
  age?:Number;
  city?:string;
  state?:string;
  gender?:string;
  price?: string;
  title?: string;
  phoneNumber?:string;
  successStatus?:boolean;
  interests?: string;
};

export const logEvent = async (
  eventName: string,
  params?: AnalyticsParams
) => {
  try {
    const filteredParams = Object.fromEntries(
      Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null)
    );

    await analytics().logEvent(eventName, filteredParams);
    console.log(`✅ Event logged: ${eventName}`, filteredParams);
  } catch (error) {
    console.error("❌ Analytics log error:", error);
  }
};
