import { compare } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with email and password',
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          400: z.object({
            message: z.string(),
          }),
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const userFormEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!userFormEmail) {
        throw new BadRequestError('Invalid credentials')
      }

      if (userFormEmail.passwordHash === null) {
        throw new BadRequestError(
          // eslint-disable-next-line prettier/prettier
          'User does not have a password, use social login.'
        )
      }

      const isPasswordValid = await compare(
        password,
        // eslint-disable-next-line prettier/prettier
        userFormEmail.passwordHash
      )

      if (!isPasswordValid) {
        throw new BadRequestError('Invalid credentials')
      }

      const token = await reply.jwtSign(
        {
          sub: userFormEmail.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
          // eslint-disable-next-line prettier/prettier
        }
      )

      return reply.status(201).send({ token })
      // eslint-disable-next-line prettier/prettier
    }
  )
}
