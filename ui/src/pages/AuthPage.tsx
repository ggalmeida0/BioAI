import { Image, StyleSheet, View } from 'react-native';
import { IconButton, Button } from 'react-native-paper';
import useAuth from '../hooks/useAuth';

const AuthPage = () => {
  const {
    loginContext: { mutate: login },
  } = useAuth();

  return (
    <View style={styles.container}>
      <Button onPress={() => login()} mode="outlined">
        <View style={styles.buttonContainer}>
          <Image
            style={{ width: 50, height: 50 }}
            source={require('../../assets/google.png')}
            onLoadEnd={() => console.log('image loade')}
          />
          Continue with Google
        </View>
      </Button>
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
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});

export default AuthPage;
