import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { AntDesign } from '@expo/vector-icons'; // Importar iconos de Expo

import Solicitud from './scr/Solicitud';
import ListSolicitud from './scr/ListSolicitud';
import Estadisticas from './scr/Estadisticas';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MyTabs() {
  return (
    <Tab.Navigator initialRouteName="Solicitud" 
    screenOptions={{
      headerStyle: {
        backgroundColor: '#F9DCC4',
      },
    }}>

      <Tab.Screen
        name="Solicitud"
        component={Solicitud}
        options={{
          tabBarLabel: 'Solicitud',
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="pluscircle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Solicitudes"
        component={ListSolicitud}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="filetext1" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Estadísticas"
        component={Estadisticas}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="barchart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function Navegacion() {
  return (
    <NavigationContainer>
     <MyTabs/> 
    </NavigationContainer>
  );
}
