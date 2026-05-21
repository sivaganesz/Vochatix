'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/providers/ToastProvider';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data.name, data.email, data.password);
      router.push('/chat');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed';
      showToast(message, 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('name')}
        id="name"
        type="text"
        label="Full name"
        placeholder="John Doe"
        error={errors.name?.message}
        autoComplete="name"
      />

      <Input
        {...register('email')}
        id="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        error={errors.email?.message}
        autoComplete="email"
      />

      <Input
        {...register('password')}
        id="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        error={errors.password?.message}
        autoComplete="new-password"
      />

      <Input
        {...register('confirmPassword')}
        id="confirmPassword"
        type="password"
        label="Confirm password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
        Create account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}
