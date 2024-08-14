import 'fastify'

import { Member, Organization } from '@prisma/client'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMembership(
      // eslint-disable-next-line prettier/prettier
      slug: string
    ): Promise<{ organization: Organization; membership: Member }>
  }
}
