import { Stack } from 'expo-router';
import { Provider } from 'react-redux'; // Remove if not using Redux, or add if needed
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

// Optional: Add a theme provider for dark/light mode
const AppThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return <ThemeProvider value={theme}>{children}</ThemeProvider>;
};

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Provider> {/* Remove if not using Redux */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="/" options={{ headerShown: false }} /> {/* For index.tsx */}
        </Stack>
      </Provider>
    </AppThemeProvider>
  );
}
