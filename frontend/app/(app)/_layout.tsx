import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from './dashboard'; // Adjust path if file is named differently (e.g., 'Dashboard.tsx')
import PlaybooksScreen from './playbooks'; // Adjust path
import CreateScreen from './create_backup'; // Uses existing create_backup.tsx

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Playbooks') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Create') iconName = focused ? 'create' : 'create-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B35', // Matches your orange theme
        tabBarInactiveTintColor: '#cccccc',
        tabBarStyle: { backgroundColor: '#0a0a0a' }, // Dark theme
        headerShown: false, // Hide headers for now
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="Playbooks"
        component={PlaybooksScreen}
        options={{ title: 'Playbooks' }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{ title: 'Create Playbook' }}
      />
    </Tab.Navigator>
  );
}
