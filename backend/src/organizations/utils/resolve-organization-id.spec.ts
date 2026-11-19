import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { resolveOrganizationId } from './resolve-organization-id.js';

const createUser = (organizationIds: string[]) => ({
  memberships: organizationIds.map((id) => ({
    organization: {
      id,
    },
  })),
});

describe('resolveOrganizationId', () => {
  it('should automatically select the only organization', () => {
    const user = createUser(['org-1']);

    expect(resolveOrganizationId(user)).toBe('org-1');
  });

  it('should select the requested organization when user has multiple memberships', () => {
    const user = createUser(['org-1', 'org-2']);

    expect(resolveOrganizationId(user, 'org-2')).toBe('org-2');
  });

  it('should throw BadRequestException when organization is not selected', () => {
    const user = createUser(['org-1', 'org-2']);

    expect(() => resolveOrganizationId(user)).toThrow(BadRequestException);
  });

  it('should throw ForbiddenException when user has no memberships', () => {
    const user = createUser([]);

    expect(() => resolveOrganizationId(user)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when requested organization is not accessible', () => {
    const user = createUser(['org-1']);

    expect(() => resolveOrganizationId(user, 'org-2')).toThrow(ForbiddenException);
  });
});
