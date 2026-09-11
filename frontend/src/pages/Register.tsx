import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAppDispatch } from '../store/hooks';
import { loginAsync } from '../store/slices/authSlice';

type Form = { email: string; password: string; name?: string };

export default function Register() {
  const { register, handleSubmit } = useForm<Form>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: Form) => {
    try {
      await api.post('/auth/register', data);
      await dispatch(loginAsync({ email: data.email, password: data.password })).unwrap();
      navigate('/');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input {...register('name')} className="w-full mt-1 p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input {...register('email')} className="w-full mt-1 p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" {...register('password')} className="w-full mt-1 p-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-sky-600 text-white py-2 rounded">Create account</button>
      </form>
    </div>
  );
}
