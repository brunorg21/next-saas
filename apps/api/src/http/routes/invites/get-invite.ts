import { roleSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function getInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/invites/:inviteId',
      {
        schema: {
          tags: ['invites'],
          summary: 'Get an invite',
          security: [{ bearerAuth: [] }],
          params: z.object({
            inviteId: z.string().uuid(),
          }),
          response: {
            200: z.object({
              invite: z.object({
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
              }),
            }),
          },
        },
      },
      async (request) => {
        const { inviteId } = request.params

        const invite = await prisma.invite.findUnique({
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
          where: { id: inviteId },
        })

        if (!invite) {
          throw new BadRequestError('Invite not found')
        }

        return { invite }

        // eslint-disable-next-line prettier/prettier
      }
    )
}
