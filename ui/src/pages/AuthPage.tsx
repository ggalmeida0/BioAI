import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import useAuth from '../hooks/useAuth';
import SignUpComponent from '../components/SignUpComponent';

const AuthPage = () => {
  const { loginWithGoogleContext: { mutate: login }, loginWithEmailContext } = useAuth();
  const [username, setUsername] = useState(''); // Add username state
  const [password, setPassword] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);

  const handleEmailLogin = () => {
    loginWithEmailContext.mutate({ username, password }); // Pass username to the mutation
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/adaptive-icon.png')} // Replace with the correct path to your image asset
        style={styles.image}
      />
      <View style={styles.toggleContainer}>
        <Text
          style={showSignUp ? styles.toggleText : [styles.toggleText, styles.activeToggle]}
          onPress={() => setShowSignUp(false)}
        >
          Login
        </Text>
        <Text
          style={!showSignUp ? styles.toggleText : [styles.toggleText, styles.activeToggle]}
          onPress={() => setShowSignUp(true)}
        >
          Sign Up
        </Text>
      </View>
      {showSignUp ? (
        <SignUpComponent />
      ) : (
        <View style={styles.formContainer}>
          <TextInput
            label="Username" // Add username input
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <Button onPress={handleEmailLogin} mode="contained" style={styles.loginButton}>
            Log In with Email
          </Button>
        </View>
      )}
      <View style={styles.orDividerContainer}>
        <View style={styles.orDivider}></View>
        <Text style={styles.orText}>OR</Text>
        <View style={styles.orDivider}></View>
      </View>
      <Button
        onPress={() => login()}
        mode="contained"
        style={styles.googleButton}
      >
        <Image
          style={styles.googleIcon}
          source={require('../../assets/google.png')}
        />
        Continue with Google
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  toggleText: {
    marginHorizontal: 10,
    color: '#A0A0A0', // Inactive toggle color
  },
  activeToggle: {
    color: '#007AFF', // Active toggle color
  },
  formContainer: {
    width: '80%',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#007AFF', // Your desired color
  },
  orDividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  orDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0', // Divider color
  },
  orText: {
    paddingHorizontal: 10,
    color: '#A0A0A0', // Text color
  },
  googleButton: {
    borderColor: '#007AFF', // Border color
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  image: {
    width: 200, 
    height: 200,
    marginBottom: 20, 
  },
});

export default AuthPage;
