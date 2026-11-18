import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service.js';

type CreateUserWithOrganizationInput = {
  email: string;
  name: string;
  passwordHash: string;
  organizationName: string;
  organizationSlug: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createWithOrganization(input: CreateUserWithOrganizationInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedSlug = input.organizationSlug.trim().toLowerCase().replace(/\s+/g, '-');

    return this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: input.name.trim(),
        passwordHash: input.passwordHash,

        memberships: {
          create: {
            role: 'OWNER',

            organization: {
              create: {
                name: input.organizationName.trim(),
                slug: normalizedSlug,
              },
            },
          },
        },
      },

      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,

        memberships: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async findOrganizations(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        memberships: {
          select: {
            role: true,
            joinedAt: true,
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.memberships;
  }

  async findByEmailForAuthentication(email: string) {
    const normalizedEmail = email.trim().toLowerCase();

    return this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
      },
    });
  }
}
