import * as React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import OAuthButton from '@/components/OAuthButton';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [username, setUsername] = React.useState('');
  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [oauthLoading, setOauthLoading] = React.useState(false);

  React.useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({
        username,
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to sign up');
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace('/');
      } else {
        Alert.alert('Error', 'Verification incomplete. Please try again.');
        console.error(JSON.stringify(signUpAttempt, null, 2));
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Verification failed');
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const handleOAuthSignUp = async (strategy: 'oauth_google' | 'oauth_github' | 'oauth_linkedin_oidc') => {
    try {
      setOauthLoading(true);

      const { createdSessionId } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL('/sign-up', { scheme: 'skinveda' }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/');
      } else {
        Alert.alert('Error', 'Unable to activate session');
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'OAuth sign-up failed');
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setOauthLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.formContainer}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            Enter the verification code sent to {emailAddress}
          </Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Enter verification code"
            placeholderTextColor="rgba(232, 180, 184, 0.5)"
            onChangeText={setCode}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Skinveda today</Text>

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={username}
            placeholder="Username"
            placeholderTextColor="rgba(232, 180, 184, 0.5)"
            onChangeText={setUsername}
          />

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email"
            placeholderTextColor="rgba(232, 180, 184, 0.5)"
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            value={password}
            placeholder="Password"
            placeholderTextColor="rgba(232, 180, 184, 0.5)"
            secureTextEntry={true}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <OAuthButton
            provider="google"
            onPress={() => handleOAuthSignUp('oauth_google')}
            disabled={oauthLoading}
            loading={oauthLoading}
          />
          <OAuthButton
            provider="github"
            onPress={() => handleOAuthSignUp('oauth_github')}
            disabled={oauthLoading}
            loading={oauthLoading}
          />
          <OAuthButton
            provider="linkedin"
            onPress={() => handleOAuthSignUp('oauth_linkedin_oidc')}
            disabled={oauthLoading}
            loading={oauthLoading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/sign-in" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#E8B4B8',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(232, 180, 184, 0.7)',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#E8B4B8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#E8B4B8',
  },
  button: {
    backgroundColor: 'rgba(232, 180, 184, 0.2)',
    borderWidth: 2,
    borderColor: '#E8B4B8',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 35,
    marginTop: 10,
    shadowColor: '#E8B4B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#E8B4B8',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: 'rgba(232, 180, 184, 0.7)',
    fontSize: 14,
  },
  link: {
    color: '#E8B4B8',
    fontSize: 14,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(232, 180, 184, 0.3)',
  },
  dividerText: {
    color: 'rgba(232, 180, 184, 0.7)',
    fontSize: 14,
    marginHorizontal: 10,
  },
});
