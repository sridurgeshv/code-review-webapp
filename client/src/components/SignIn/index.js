import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function SignIn() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <button
          onClick={handleSignIn}
          className="flex items-center justify-center w-full bg-white border border-gray-300 rounded-lg px-6 py-3 hover:bg-gray-50"
        >
          <img
            src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg"
            alt="Google"
            className="w-6 h-6 mr-2"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default SignIn;