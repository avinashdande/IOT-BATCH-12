import React, { useState } from 'react';  
import {  
  View,  
  Text,  
  TextInput,  
  TouchableOpacity,  
  StyleSheet,  
  SafeAreaView,  
  Alert,  
} from 'react-native';  
import { Link, useRouter } from 'expo-router';  
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterPage = () => {  
  const [fullName, setFullName] = useState('');  
  const [email, setEmail] = useState('');  
  const [password, setPassword] = useState('');  
  const [confirmPassword, setConfirmPassword] = useState('');  
  const [loading, setLoading] = useState(false);  
  const router = useRouter(); // Get navigation object  

  const validateEmail = (email) => {  
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  
    return regex.test(email);  
  };  

  const handleSignUp = async () => {  
    if (!fullName || !email || !password || !confirmPassword) {  
      Alert.alert('Error', 'Please fill in all fields');  
      return;  
    }  

    if (!validateEmail(email)) {  
      Alert.alert('Error', 'Please enter a valid email address');  
      return;  
    }  

    if (password !== confirmPassword) {  
      Alert.alert('Error', 'Passwords do not match');  
      return;  
    }  

    setLoading(true);  

    try {  
      // Save user data in AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify({
        fullName,
        email,
        password, // In a real app, passwords should be encrypted before storing!
      }));

      Alert.alert('Success', 'Account created successfully!');
      router.push('/'); // Navigate to home page ("/")  
    } catch (error) {  
      console.error('Registration error:', error.message);  
      Alert.alert('Error', 'Something went wrong. Please try again.');  
    } finally {  
      setLoading(false);  
    }  
  };  

  return (  
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>  
        <Text style={styles.headerText}>Create Account</Text>  
      </View>  

      <View style={styles.formContainer}>  
        <TextInput  
          style={styles.input}  
          placeholder="Full Name"  
          value={fullName}  
          onChangeText={setFullName}  
        />  
        <TextInput  
          style={styles.input}  
          placeholder="Email"  
          keyboardType="email-address"  
          value={email}  
          onChangeText={setEmail}  
        />  
        <TextInput  
          style={styles.input}  
          placeholder="Password"  
          secureTextEntry={true}  
          value={password}  
          onChangeText={setPassword}  
        />  
        <TextInput  
          style={styles.input}  
          placeholder="Confirm Password"  
          secureTextEntry={true}  
          value={confirmPassword}  
          onChangeText={setConfirmPassword}  
        />  
        <TouchableOpacity  
          style={styles.signUpButton}  
          onPress={handleSignUp}  
          disabled={loading}  
        >  
          <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>  
        </TouchableOpacity>  

        <View style={styles.logInContainer}>  
          <Text style={styles.logInText}>Already have an account?</Text>  
          <Link href="/index" style={styles.logInLink}>  
            Log In  
          </Link>  
        </View>  
      </View>  
    </SafeAreaView>  
  );  
};  

const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    backgroundColor: '#f5f5f5',  
    justifyContent: 'center',  
    paddingHorizontal: 20,  
  },  
  header: {  
    alignItems: 'center',  
    marginBottom: 40,  
  },  
  headerText: {  
    fontSize: 28,  
    fontWeight: 'bold',  
    color: '#333',  
  },  
  formContainer: {  
    backgroundColor: '#fff',  
    padding: 30,  
    borderRadius: 10,  
    elevation: 5,  
    shadowColor: '#000',  
    shadowOpacity: 0.1,  
    shadowRadius: 5,  
  },  
  input: {  
    height: 50,  
    borderColor: '#ccc',  
    borderWidth: 1,  
    borderRadius: 10,  
    marginBottom: 20,  
    paddingLeft: 10,  
    fontSize: 16,  
  },  
  signUpButton: {  
    backgroundColor: '#4CAF50',  
    paddingVertical: 15,  
    borderRadius: 10,  
    alignItems: 'center',  
    marginBottom: 15,  
  },  
  buttonText: {  
    color: '#fff',  
    fontSize: 18,  
    fontWeight: 'bold',  
  },  
  logInContainer: {  
    flexDirection: 'row',  
    justifyContent: 'center',  
    marginTop: 20,  
  },  
  logInText: {  
    fontSize: 16,  
  },  
  logInLink: {  
    color: '#4CAF50',  
    fontWeight: 'bold',  
    marginLeft: 5,  
  },  
});  

export default RegisterPage;  
