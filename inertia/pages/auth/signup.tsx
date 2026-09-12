import { Form, Link } from '@adonisjs/inertia/react'

import AuthLayout from '@/layouts/auth_layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Signup() {
  return (
    <AuthLayout
      title="Create your account"
      description="Enter your details below to get started with Influx"
      footer={
        <>
          Already have an account?{' '}
          <Link route="session.create" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Form route="new_account.store" className="flex flex-col gap-5">
        {({ errors, processing }) => (
          <>
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                aria-invalid={errors.fullName ? true : undefined}
              />
              {errors.fullName && <p className="text-destructive text-sm">{errors.fullName}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
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
                autoComplete="new-password"
                aria-invalid={errors.password ? true : undefined}
              />
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="passwordConfirmation">Confirm password</Label>
              <Input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                aria-invalid={errors.passwordConfirmation ? true : undefined}
              />
              {errors.passwordConfirmation && (
                <p className="text-destructive text-sm">{errors.passwordConfirmation}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
              Create account
            </Button>
          </>
        )}
      </Form>
    </AuthLayout>
  )
}
