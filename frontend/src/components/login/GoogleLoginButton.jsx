import React from 'react';

const GoogleLoginButton = () => {
  const handleLogin = () => {
    window.open('http://localhost:5000/auth/google', '_self');
  };

  return (
    <button onClick={handleLogin} className="btn-google w-100">
      Iniciar sesión con Google
    </button>
  );
};

export default GoogleLoginButton;
