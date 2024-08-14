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
import { signInWithEmailAndPassword } from './actions'

export function SignInForm() {
  // const [{ errors, message, success }, formAction, isPending] = useActionState(
  //   signInWithEmailAndPassword,
  //   // eslint-disable-next-line prettier/prettier
  //   { success: false, message: null, errors: null }
  // )

  const router = useRouter()

  const [{ errors, message, success }, handleSignIn, isPending] = useFormState(
    // eslint-disable-next-line prettier/prettier
    signInWithEmailAndPassword,
    () => {
      router.push('/')
      // eslint-disable-next-line prettier/prettier
    }
  )

  return (
    <div className="space-y-4">
      <form onSubmit={handleSignIn} className="space-y-4">
        {success === false && message && (
          <Alert variant={'destructive'}>
            <AlertTriangle className="size-4" />
            <AlertTitle>Sign in failed!</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

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
          <Link
            className="medium text-xs text-foreground hover:underline"
            href={'/auth/forgot-password'}
          >
            Forgot your password?
          </Link>
        </div>

        <Button disabled={isPending} className="w-full" type="submit">
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Sign in with e-mail'
          )}
        </Button>

        <Button asChild size={'sm'} className="w-full" variant={'link'}>
          <Link href={'/auth/sign-up'}>Create new account</Link>
        </Button>

        <Separator />
      </form>
      <form action={signInWithGithub}>
        <Button
          type="submit"
          variant={'outline'}
          className="flex w-full items-center gap-2"
        >
          <GithubIcon />
          Sign in with Github
        </Button>
      </form>
    </div>
  )
}
