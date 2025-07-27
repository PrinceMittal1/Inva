// BottomTabs.tsx or inside same file
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../Screens/Home';
import Chat from '../Screens/Chat';
import Profile from '../Screens/Profile';
import Images from '../Keys/Images';
import { Image } from 'react-native';
import ComparisonScreen from '../Screens/ComparsionScreen';
import Search from '../Screens/Search';
import ChatListing from '../Screens/ChatListing';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {  },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={Images?.home} style={{width:20, height:20, tintColor : focused ? 'grey' : 'black'}} resizeMode={'contain'}/>
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ focused }) => (
           <Image source={Images?.search} style={{width:20, height:20, tintColor : focused ? 'grey' : 'black'}} resizeMode={'contain'}/>
          ),
        }}
      />
      <Tab.Screen
        name="ChatListing"
        component={ChatListing}
        options={{
          tabBarIcon: ({ focused }) => (
           <Image source={Images?.chat} style={{width:20, height:20, tintColor : focused ? 'grey' : 'black'}} resizeMode={'contain'}/>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image source={Images?.person} style={{width:20, height:20, tintColor : focused ? 'grey' : 'black'}} resizeMode={'contain'}/>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
