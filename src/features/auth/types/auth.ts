export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface OrganizationMembership {
  role: OrganizationRole;
  organization: Organization;
}

export interface User {
  id: string;
  email: string;
  name: string;
  memberships: OrganizationMembership[];
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface RegisterResponse extends User {
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
