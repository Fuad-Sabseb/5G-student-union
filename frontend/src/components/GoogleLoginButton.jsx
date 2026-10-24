import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';

/**
 * Secure Google Login Button Component
 * 
 * Uses @react-oauth/google library with proper OAuth 2.0 flow:
 * - Shows Google's actual account chooser
 * - Receives a verified ID token from Google
 * - Sends the ID token to backend for cryptographic verification
 * 
 * @param {Function} onSuccess - Callback with ID token credential
 * @param {Function} onError - Callback for error handling
 * @param {string} buttonText - Text to display on the button
 * @param {boolean} disabled - Whether the button is disabled
 */
export default function GoogleLoginButton({ 
  onSuccess, 
  onError, 
  buttonText,
  disabled = false,
}) {
  const { t } = useTranslation();

  const handleSuccess = (credentialResponse) => {
    // credentialResponse.credential contains the JWT ID token
    if (credentialResponse?.credential) {
      onSuccess(credentialResponse.credential);
    } else {
      onError?.(new Error('No credential received from Google'));
    }
  };

  const handleError = () => {
    const error = new Error('Google Sign-In failed');
    console.error('Google login failed');
    onError?.(error);
  };

  return (
    <div className="google-login-wrapper">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false}
        auto_select={false}
        context="signup"
        ux_mode="popup"
        text={buttonText || t('auth.continue_google')}
        width="100%"
        disabled={disabled}
        // Force account selection on every login
        prompt="select_account"
      />
    </div>
  );
}
