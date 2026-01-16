import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryStoreDto } from './dto/query-store.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { OperatingHourDto } from './dto/operating-hour.dto';

export const storeSelections = {
  storeId: true,
  ownerId: true,
  avatar: true,
  name: true,
  description: true,
  inviteCode: true,
  storeStatus: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: false,
  operatingHour: true,
};

@Injectable()
export class StoreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(storeId: number) {
    return await this.prisma.store.findFirst({
      where: { storeId, deletedAt: null },
      select: { ...storeSelections },
    });
  }

  async createStore(createDto: CreateStoreDto, ownerId: number) {
    return await this.prisma.store.create({
      data: {
        ownerId,
        ...createDto,
      },
      select: { ...storeSelections },
    });
  }

  async updateStore(updateDto: UpdateStoreDto, storeId: number) {
    return await this.prisma.store.update({
      where: { storeId },
      data: {
        ...updateDto,
      },
      select: { ...storeSelections },
    });
  }

  async deleteStore(storeId: number) {
    return await this.prisma.store.update({
      where: { storeId },
      data: { deletedAt: new Date() },
    });
  }

  // Operating hour repo
  async updateOperatingHour(updateDto: OperatingHourDto, storeId: number) {
    return await this.prisma.store.update({
      where: { storeId },
      data: {
        operatingHour: updateDto as any,
      },
      select: { ...storeSelections },
    });
  }

  async getOperatingHour(storeId: number) {
    return await this.prisma.store.findUnique({
      where: { storeId },
      select: { operatingHour: true },
    });
  }

  // Invitation repo
  async createInviteLink(token: string, storeId: number) {
    return await this.prisma.store.update({
      where: { storeId },
      data: { inviteCode: token },
    });
  }

  async getInviteLink(storeId: number) {
    return await this.prisma.store.findUnique({
      where: { storeId },
    });
  }

  async getInvitations(storeId: number) {
    return await this.prisma.member.findMany({
      where: { storeId, status: 'PENDING' },
    });
  }

  async getInvitationToken(token: string) {
    return await this.prisma.store.findFirst({
      where: { inviteCode: token },
    });
  }
}
