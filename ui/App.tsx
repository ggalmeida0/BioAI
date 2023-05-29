import { Amplify } from 'aws-amplify';
import awsconfig from './aws-config';
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import Chat from './src/pages/Chat';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useAuth from './src/hooks/useAuth';
import AuthPage from './src/pages/AuthPage';

Amplify.configure(awsconfig);

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#BF3B9C',
    secondary: '#23D9C7',
  },
};

const queryClient = new QueryClient();

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeView}>
        <QueryClientProvider client={queryClient}>
          <AuthenticatedApp />
        </QueryClientProvider>
      </SafeAreaView>
    </PaperProvider>
  );
};

const AuthenticatedApp = () => {
  const { userAuthContext } = useAuth(queryClient);

  return <>{userAuthContext.isSuccess ? <Chat /> : <AuthPage />}</>;
};

const styles = StyleSheet.create({
  safeView: {
    width: '100%',
    height: '100%',
  },
});

export default App;
