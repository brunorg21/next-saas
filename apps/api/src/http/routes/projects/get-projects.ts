import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:slug/projects',
      {
        schema: {
          tags: ['projects'],
          summary: 'Get all organizaton projects',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              projects: z.array(
                z.object({
                  name: z.string(),
                  id: z.string().uuid(),
                  slug: z.string(),
                  ownerId: z.string().uuid(),
                  createdAt: z.date(),
                  organizationId: z.string().uuid(),
                  description: z.string(),
                  avatarUrl: z.string().nullable(),
                  owner: z.object({
                    name: z.string().nullable(),
                    id: z.string().uuid(),
                    avatarUrl: z.string().nullable(),
                  }),
                  // eslint-disable-next-line prettier/prettier
                })
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const { membership, organization } =
          await request.getUserMembership(slug)

        const userId = await request.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project')) {
          throw new UnauthorizedError(
            // eslint-disable-next-line prettier/prettier
            "You're not allowed to see organization projects."
          )
        }

        const projects = await prisma.project.findMany({
          where: { organizationId: organization.id },
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            ownerId: true,
            organizationId: true,
            avatarUrl: true,
            createdAt: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        return reply.send({ projects })

        // eslint-disable-next-line prettier/prettier
      }
    )
}
