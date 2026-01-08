import OAuthButton from '@/components/OAuthButton';
import { useOAuth, useSignIn } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const googleOAuth = useOAuth({ strategy: 'oauth_google' });
  const githubOAuth = useOAuth({ strategy: 'oauth_github' });
  const linkedinOAuth = useOAuth({ strategy: 'oauth_linkedin_oidc' });
  const router = useRouter();

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loadingProvider, setLoadingProvider] = React.useState<'google' | 'github' | 'linkedin' | null>(null);

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

  const handleOAuthSignIn = async (provider: 'google' | 'github' | 'linkedin') => {
    try {
      setLoadingProvider(provider);

      const oauthFlow = provider === 'google' ? googleOAuth
                      : provider === 'github' ? githubOAuth
                      : linkedinOAuth;

      const { createdSessionId, setActive: oauthSetActive, signIn: oauthSignIn } = await oauthFlow.startOAuthFlow({
        redirectUrl: Linking.createURL('/(auth)/sign-in', { scheme: 'skinveda' }),
      });

      if (createdSessionId && oauthSetActive) {
        await oauthSetActive({ session: createdSessionId });
        router.replace('/');
      } else {
        Alert.alert('Error', 'OAuth sign-in incomplete');
      }
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'OAuth sign-in failed');
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoadingProvider(null);
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
            onPress={() => handleOAuthSignIn('google')}
            disabled={loadingProvider !== null}
            loading={loadingProvider === 'google'}
          />
          <OAuthButton
            provider="github"
            onPress={() => handleOAuthSignIn('github')}
            disabled={loadingProvider !== null}
            loading={loadingProvider === 'github'}
          />
          <OAuthButton
            provider="linkedin"
            onPress={() => handleOAuthSignIn('linkedin')}
            disabled={loadingProvider !== null}
            loading={loadingProvider === 'linkedin'}
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
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#E8B4B8',
  },
  button: {
    backgroundColor: 'rgba(232, 180, 184, 0.2)',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 35,
    marginTop: 10,
    shadowColor: '#E8B4B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
