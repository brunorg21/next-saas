import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getPendingInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/pending-invites',
      {
        schema: {
          tags: ['invites'],
          summary: 'Get all pending invites',
          security: [{ bearerAuth: [] }],

          response: {
            200: z.object({
              invites: z.array(
                z.object({
                  organization: z.object({
                    name: z.string(),
                  }),
                  id: z.string().uuid(),
                  createdAt: z.date(),
                  role: roleSchema,
                  email: z.string().email(),
                  author: z
                    .object({
                      name: z.string().nullable(),
                      id: z.string().uuid(),
                      avatarUrl: z.string().url().nullable(),
                    })
                    .nullable(),
                  // eslint-disable-next-line prettier/prettier
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()

        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        })

        if (!user) {
          throw new BadRequestError('User not found.')
        }

        const invites = await prisma.invite.findMany({
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
            organization: {
              select: {
                name: true,
              },
            },
          },
          where: {
            email: user.email,
          },
        })

        return reply.status(200).send({ invites })

        // eslint-disable-next-line prettier/prettier
      }
    )
}
