import { FormEvent, useState, useTransition } from 'react'

interface FormState {
  message: string | null
  errors: Record<string, string[]> | null
  success: boolean
}

export function useFormState(
  action: (data: FormData) => Promise<FormState>,
  onSuccess?: () => Promise<void> | void,
  // eslint-disable-next-line prettier/prettier
  initialState?: FormState
) {
  const [isPending, startTransition] = useTransition()

  const [formState, setFormState] = useState<FormState>(
    initialState ?? {
      success: false,
      errors: null,
      message: null,
      // eslint-disable-next-line prettier/prettier
    }
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const form = event.currentTarget
    const data = new FormData(form)

    startTransition(async () => {
      const result = await action(data)

      if (result.success && onSuccess) {
        await onSuccess()
      }

      setFormState(result)
    })
  }

  return [formState, handleSubmit, isPending] as const
}
