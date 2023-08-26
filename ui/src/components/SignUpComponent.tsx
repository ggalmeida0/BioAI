import React, { useState } from 'react';
import { Button, TextInput } from 'react-native-paper';
import { View, Text, StyleSheet } from 'react-native';
import useAuth from '../hooks/useAuth'; // Adjust the import path as needed

const SignUpComponent: React.FC = () => {
  const { signUpWithEmailContext } = useAuth();
  const [username, setUsername] = useState(''); // Add username state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignUp = async () => {
    try {
      await signUpWithEmailContext.mutateAsync({ username, email, password }); // Pass username to the mutation
      setSuccessMessage('Sign-up successful!');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage('Sign-up failed. Please try again.');
      setSuccessMessage(null);
    }
  };

  return (
    <View style={styles.formContainer}>
      {successMessage && <Text style={styles.successMessage}>{successMessage}</Text>}
      {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
      <TextInput
        label="Username" // Add username input
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button onPress={handleSignUp} mode="contained" style={styles.signUpButton}>
        Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '80%',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  signUpButton: {
    backgroundColor: '#007AFF', // Your desired color
  },
  successMessage: {
    color: 'green',
    marginBottom: 10,
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
  },
});

export default SignUpComponent;
