import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import Button from '../components/common/Button';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMsg('');
      const loggedInUser = await login(identifier.trim(), password);
      if (loggedInUser.role === 'admin') navigate('/admin');
      else if (loggedInUser.role === 'partner') navigate('/partner');
      else if (loggedInUser.role === 'technician') navigate('/technician');
      else navigate(redirectPath);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify your email/phone and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-airtel-700 to-airtel-500 text-white font-extrabold flex items-center justify-center mx-auto text-xl shadow-md shadow-red-500/20">
          A
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {t('auth.signInTitle', 'Sign in to Airtel Business')}
        </h2>
        <p className="text-xs text-slate-500">
          {t('auth.subTitleLogin', 'Project Udyam Digital • Enterprise B2B Solutions')}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-sm border border-slate-200 rounded-3xl space-y-5">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.identifierLabel', 'Email Address or 10-Digit Mobile Phone')}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. rajesh@guptasupermart.in or 9810123456"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.passwordLabel', 'Password')}
              </label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              icon={LogIn}
              className="w-full text-xs shadow-md shadow-red-500/20"
            >
              {t('common.signIn', 'Sign In')}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            {t('auth.dontHaveAccount', "Don't have an account?")}{' '}
            <Link to="/register" className="font-bold text-airtel-700 hover:underline">
              {t('auth.registerBusiness', 'Register Business')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
