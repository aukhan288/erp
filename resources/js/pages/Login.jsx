import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { Navigate } from 'react-router-dom';
import PageMeta from "../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../components/auth/SignInForm";

export default function Login() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(login({ email, password }));
  };

  if (user) return <Navigate to="/dashboard" />;

  return (
    <>
      <PageMeta
        title="React.js SignIn Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}