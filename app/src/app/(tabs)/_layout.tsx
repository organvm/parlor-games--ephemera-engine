import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Sessions',
          tabBarLabel: 'Home',
        }} 
      />
      {/* Settings tab can be added later (T011) */}
    </Tabs>
  );
}
