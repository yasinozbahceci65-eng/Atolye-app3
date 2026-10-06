import { Tabs } from 'expo-router';
import { Home, Wrench, Calculator, Users, Settings } from 'lucide-react-native';
import { Colors } from '@/lib/colors';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarPaddingBottom = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : Math.max(insets.bottom + 8, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.neutral400,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.neutral200,
          borderTopWidth: 1,
          height: 60 + tabBarPaddingBottom,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <Home color={color} size={26} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="atolye"
        options={{
          title: 'Atölye',
          tabBarIcon: ({ color }) => <Wrench color={color} size={26} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="projeler"
        options={{
          title: 'Projeler',
          tabBarIcon: ({ color }) => <Calculator color={color} size={26} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="uzman"
        options={{
          title: 'Uzman',
          tabBarIcon: ({ color }) => <Users color={color} size={26} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color }) => <Settings color={color} size={26} strokeWidth={2.2} />,
        }}
      />
    </Tabs>
  );
}
