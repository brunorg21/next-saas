import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

import { BadRequestError } from '../_errors/bad-request-error'
import { UnauthorizedError } from '../_errors/unauthorized-error'

export async function getProjects(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:orgSlug/projects/:projectSlug',
      {
        schema: {
          tags: ['projects'],
          summary: 'Get project details',
          security: [{ bearerAuth: [] }],
          params: z.object({
            orgSlug: z.string(),
            projectSlug: z.string(),
          }),
          response: {
            200: z.object({
              project: z.object({
                name: z.string(),
                id: z.string().uuid(),
                slug: z.string(),
                ownerId: z.string().uuid(),
                organizationId: z.string().uuid(),
                description: z.string(),
                avatarUrl: z.string().nullable(),
                owner: z.object({
                  name: z.string().nullable(),
                  id: z.string().uuid(),
                  avatarUrl: z.string().nullable(),
                }),
              }),
            }),
          },
        },
      },
      async (request, reply) => {
        const { orgSlug, projectSlug } = request.params

        const { membership, organization } =
          await request.getUserMembership(orgSlug)

        const userId = await request.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project')) {
          throw new UnauthorizedError(
            // eslint-disable-next-line prettier/prettier
            "You're not allowed to see this project."
          )
        }

        const project = await prisma.project.findUnique({
          where: { slug: projectSlug, organizationId: organization.id },
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            ownerId: true,
            organizationId: true,
            avatarUrl: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found.')
        }

        return reply.send({ project })

        // eslint-disable-next-line prettier/prettier
      }
    )
}
