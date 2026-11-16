import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            memberships: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,

        memberships: {
          select: {
            id: true,
            role: true,
            joinedAt: true,

            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async findMembers(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        memberships: {
          select: {
            role: true,
            joinedAt: true,

            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        orderBy: {
          joinedAt: 'asc',
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization.memberships;
  }
}
