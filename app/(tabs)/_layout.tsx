import { Tabs } from 'expo-router';
import { Home, Wrench, Calculator, Users, Settings } from 'lucide-react-native';
import { Colors } from '@/lib/colors';
import { usePro } from '@/lib/pro-context';
import { showInterstitial } from '@/lib/ads';
import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { isPro } = usePro();
  const insets = useSafeAreaInsets();

  const onTabPress = useCallback(() => {
    showInterstitial(isPro);
  }, [isPro]);

  const tabBarPaddingBottom = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : Math.max(insets.bottom + 8, 12);

  return (
    <Tabs
      screenListeners={{
        tabPress: onTabPress,
      }}
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
          tabBarIcon: ({ color, size }) => <Home color={color} size={26} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="atolye"
        options={{
          title: 'Atölye',
          tabBarIcon: ({ color, size }) => <Wrench color={color} size={26} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="projeler"
        options={{
          title: 'Projeler',
          tabBarIcon: ({ color, size }) => <Calculator color={color} size={26} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="uzman"
        options={{
          title: 'Uzman',
          tabBarIcon: ({ color, size }) => <Users color={color} size={26} strokeWidth={2.2} />,
        }}
      />
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={26} strokeWidth={2.2} />,
        }}
      />
    </Tabs>
  );
}
