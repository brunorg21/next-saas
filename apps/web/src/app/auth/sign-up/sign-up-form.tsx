'use client'
import { AlertTriangle, GithubIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useFormState } from '@/app/hooks/use-form-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { signInWithGithub } from '../actions'
import { signUpAction } from './actions'

export function SignUpForm() {
  const router = useRouter()

  const [{ errors, message, success }, handleSignUp, isPending] = useFormState(
    // eslint-disable-next-line prettier/prettier
    signUpAction,
    () => {
      router.push('/auth/sign-in')
      // eslint-disable-next-line prettier/prettier
    }
  )

  return (
    <div className="space-y-4">
      <form onSubmit={handleSignUp} className="space-y-4">
        {success === false && message && (
          <Alert variant={'destructive'}>
            <AlertTriangle className="size-4" />
            <AlertTitle>Sign up failed!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input type="text" id="name" name="name" />
          {errors?.name && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors?.name[0]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input type="email" name="email" id="email" />
          {errors?.email && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors?.email[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input type="password" name="password" id="password" />
          {errors?.password && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors?.password[0]}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Confirm your password</Label>
          <Input type="password" name="confirmPassword" id="confirmPassword" />
          {errors?.confirmPassword && (
            <p className="text-xs font-medium text-red-500 dark:text-red-400">
              {errors?.confirmPassword[0]}
            </p>
          )}
        </div>

        <Button disabled={isPending} className="w-full" type="submit">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Create account'
          )}
        </Button>

        <Button asChild size={'sm'} className="w-full" variant={'link'}>
          <Link href={'/auth/sign-in'}>Already registered? Sign in</Link>
        </Button>
      </form>
      <Separator />

      <form action={signInWithGithub}>
        <Button
          type="submit"
          variant={'outline'}
          className="flex w-full items-center gap-2"
        >
          <GithubIcon />
          Sign up with Github
        </Button>
      </form>
    </div>
  )
}
