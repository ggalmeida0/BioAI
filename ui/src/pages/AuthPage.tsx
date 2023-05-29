import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import useAuth from '../hooks/useAuth';

const AuthPage = () => {
  const {
    loginContext: { mutate: login },
  } = useAuth();

  return (
    <View style={styles.container}>
      <Button onPress={() => login()}>Login w/ Google</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});

export default AuthPage;
