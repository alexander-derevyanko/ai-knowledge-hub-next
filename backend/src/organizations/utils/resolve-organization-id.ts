import { BadRequestException, ForbiddenException } from '@nestjs/common';

interface OrganizationMembership {
  organization: {
    id: string;
  };
}

interface UserOrganizationContext {
  memberships: OrganizationMembership[];
}

export function resolveOrganizationId(
  user: UserOrganizationContext,
  requestedOrganizationId?: string,
): string {
  const { memberships } = user;

  if (memberships.length === 0) {
    throw new ForbiddenException('User has no organization membership');
  }

  if (!requestedOrganizationId) {
    if (memberships.length === 1) {
      return memberships[0].organization.id;
    }

    throw new BadRequestException('Organization context is required');
  }

  const membership = memberships.find(
    ({ organization }) => organization.id === requestedOrganizationId,
  );

  if (!membership) {
    throw new ForbiddenException('Access to this organization is denied');
  }

  return membership.organization.id;
}
