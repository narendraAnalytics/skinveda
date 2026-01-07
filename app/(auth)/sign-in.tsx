import { useSignIn, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
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
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import OAuthButton from '@/components/OAuthButton';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [oauthLoading, setOauthLoading] = React.useState(false);

  React.useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/');
      } else {
        Alert.alert('Error', 'Sign-in incomplete. Please try again.');
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to sign in');
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const handleOAuthSignIn = async (strategy: 'oauth_google' | 'oauth_github' | 'oauth_linkedin_oidc') => {
    try {
      setOauthLoading(true);

      const { createdSessionId } = await startSSOFlow({
        strategy,
        redirectUrl: Linking.createURL('/sign-in', { scheme: 'skinveda' }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/');
      } else {
        Alert.alert('Error', 'Unable to activate session');
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'OAuth sign-in failed');
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={identifier}
            placeholder="Email or Username"
            placeholderTextColor="rgba(232, 180, 184, 0.5)"
            onChangeText={setIdentifier}
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

          <TouchableOpacity style={styles.button} onPress={onSignInPress}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <OAuthButton
            provider="google"
            onPress={() => handleOAuthSignIn('oauth_google')}
            disabled={oauthLoading}
            loading={oauthLoading}
          />
          <OAuthButton
            provider="github"
            onPress={() => handleOAuthSignIn('oauth_github')}
            disabled={oauthLoading}
            loading={oauthLoading}
          />
          <OAuthButton
            provider="linkedin"
            onPress={() => handleOAuthSignIn('oauth_linkedin_oidc')}
            disabled={oauthLoading}
            loading={oauthLoading}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/sign-up" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign up</Text>
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
