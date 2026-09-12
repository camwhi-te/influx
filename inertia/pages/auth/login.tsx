import { Form, Link } from '@adonisjs/inertia/react'

import AuthLayout from '@/layouts/auth_layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your details below to sign in to your account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link route="new_account.create" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <Form route="session.store" className="flex flex-col gap-5">
        {({ errors, processing }) => (
          <>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                aria-invalid={errors.email ? true : undefined}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
              />
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
              Sign in
            </Button>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}
