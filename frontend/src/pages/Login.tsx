import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { loginAsync } from '../store/slices/authSlice';

type Form = { email: string; password: string };

export default function Login() {
  const { register, handleSubmit } = useForm<Form>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: Form) => {
    try {
      await dispatch(loginAsync(data)).unwrap();
      navigate('/');
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Login failed. Check your email and password.');
    }   
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm">Email</label>
          <input {...register('email')} className="w-full mt-1 p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" {...register('password')} className="w-full mt-1 p-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-sky-600 text-white py-2 rounded">Sign in</button>
      </form>
    </div>
  );
}
