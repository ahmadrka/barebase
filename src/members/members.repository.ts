import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryMemberDto } from './dto/query-member.dto';
import { MemberRole, MemberStatus } from 'src/generated/prisma/enums';
import { CreateMemberDto } from './dto/create-member.dto';
import { QueryStoreDto } from 'src/stores/dto/query-store.dto';
import { userSelections } from 'src/users/repositories/users.repository';
import { storeSelections } from 'src/stores/stores.repository';
import { InvitationDto } from 'src/stores/dto/invitation.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

const selections = {
  memberId: true,
  userId: true,
  storeId: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class MemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllStore(userId: number, query: QueryStoreDto) {
    const { search } = query;

    return await this.prisma.member.findMany({
      where: {
        userId,
        store: {
          AND: [
            search ? { name: { contains: search, mode: 'insensitive' } } : {},
          ],
        },
      },
      include: {
        store: {
          select: { ...storeSelections },
        },
      },
    });
  }

  async findAllMember(storeId: number, query?: QueryMemberDto) {
    const { search, email } = query || {};

    return await this.prisma.member.findMany({
      where: {
        storeId,
        user: {
          AND: [
            search ? { name: { contains: search, mode: 'insensitive' } } : {},
            email ? { email: { contains: email, mode: 'insensitive' } } : {},
          ],
        },
      },
      include: {
        user: {
          select: { ...userSelections },
        },
      },
    });
  }

  async findOne(storeId: number, userId: number) {
    return await this.prisma.member.findFirst({
      where: { storeId, userId },
      include: { user: { select: { ...userSelections } } },
    });
  }

  async findById(memberId: number) {
    return await this.prisma.member.findFirst({ where: { memberId } });
  }

  async createMember(
    storeId: number,
    userId: number,
    createDto: CreateMemberDto,
  ) {
    return await this.prisma.member.create({
      data: { storeId, userId, role: createDto.role, status: createDto.status },
      select: { ...selections },
    });
  }

  async updateMember(
    storeId: number,
    userId: number,
    updateMemberDto: UpdateMemberDto,
  ) {
    return await this.prisma.member.update({
      where: { userId_storeId: { storeId, userId } },
      data: { ...updateMemberDto },
      select: { ...selections },
    });
  }

  async deleteMember(storeId: number, userId: number) {
    return await this.prisma.member.delete({
      where: { userId_storeId: { storeId, userId } },
    });
  }

  // Invitation repo
  async createInvitation(userId: number, storeId: number, role: MemberRole) {
    return await this.prisma.member.create({
      data: { userId, storeId, role, status: 'PENDING' },
    });
  }

  async getInvitations(userId: number) {
    return await this.prisma.member.findMany({
      where: { userId, status: 'PENDING' },
      select: { ...selections },
    });
  }

  async joinFromInvited(inviteId: number, accept: boolean, userId: number) {
    const invitation = await this.prisma.member.findFirst({
      where: {
        memberId: inviteId,
        userId: userId,
        status: 'PENDING',
      },
    });

    if (!invitation) return null;

    return await this.prisma.member.update({
      where: { memberId: inviteId },
      data: { status: accept ? 'ACTIVE' : 'INACTIVE' },
    });
  }

  async getMemberCount(storeId: number) {
    return await this.prisma.member.count({
      where: { storeId },
    });
  }
}
