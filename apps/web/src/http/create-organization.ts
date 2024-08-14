import { api } from './api-client'

interface CreateOrganizationRequest {
  name: string
  domain: string | null
  shouldAttachUsersByDomain: boolean
}
type CreateOrganizationResponse = void

export async function createOrganization({
  domain,
  name,
  shouldAttachUsersByDomain,
}: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
  await api
    .post('organizations', {
      json: { shouldAttachUsersByDomain, domain, name },
    })
    .json<CreateOrganizationResponse>()
}
