import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { login } from '../../services/auth.service';
import { useToast } from '../../hooks/useToast';
import logoUrl from '../../assets/logo.svg';

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await login(data);
      setUser(response.user);
      setToken(response.token);
      showSuccess('Logged in successfully');
      navigate('/dashboard');
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white rounded-full p-4 shadow-sm border border-[var(--color-border-main)] flex items-center justify-center">
            <img src={logoUrl} alt="Antara Homoeopathy" className="h-16 w-auto" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[var(--color-text-dark)] uppercase tracking-wide">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-[var(--color-primary)] font-medium">
          Antara Homoeopathy
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[var(--color-border-main)]">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="admin@antara.com"
              {...register('email', { required: true })} 
            />

            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••"
              {...register('password', { required: true })} 
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[var(--color-text-dark)]">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-medium)] transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
