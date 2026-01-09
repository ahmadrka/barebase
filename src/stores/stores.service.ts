import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { QueryStoreDto } from './dto/query-store.dto';
import { StoreRepository } from './stores.repository';
import { MemberRepository } from 'src/members/members.repository';
import { ErrorCode } from 'src/helper/enum/error-code';
import { generateToken } from 'src/helper/function/crypto-token';
import { InvitationDto } from './dto/invitation.dto';
import { UserRepository } from 'src/users/repositories/users.repository';
import { MemberRole } from 'src/generated/prisma/enums';
import { sendInvitationEmail } from 'src/helper/function/resend-email';
import { ProductRepository } from 'src/products/repositories/products.repository';

@Injectable()
export class StoresService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly storeRepo: StoreRepository,
    private readonly memberRepo: MemberRepository,
    private readonly productRepo: ProductRepository,
  ) {}

  findAll(query: QueryStoreDto, userId: number) {
    return this.memberRepo.findAllStore(userId, query);
  }

  findOne(storeId: number) {
    return this.storeRepo.findOne(storeId);
  }

  async createStore(createDto: CreateStoreDto, userId: number) {
    const createStore = await this.storeRepo.createStore(createDto, userId);
    const addingOwner = await this.memberRepo.createMember(
      createStore.storeId,
      userId,
      { role: 'OWNER', status: 'ACTIVE' },
    );
    return { success: true, ...createStore, members: addingOwner };
  }

  async updateStore(
    updateDto: UpdateStoreDto,
    storeId: number,
    userId: number,
  ) {
    const store = await this.storeRepo.findOne(storeId);
    if (!store) {
      throw new NotFoundException({
        message: 'Store not found',
        errorCode: ErrorCode.STORE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
        errorCode: ErrorCode.MEMBER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (member.role !== 'OWNER' && member.role !== 'MANAGER') {
      throw new ForbiddenException({
        message: 'You are not authorized to update this store',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
    return this.storeRepo.updateStore(updateDto, storeId);
  }

  async deleteStore(storeId: number, userId: number) {
    const store = await this.storeRepo.findOne(storeId);
    if (!store) {
      throw new NotFoundException({
        message: 'Store not found',
        errorCode: ErrorCode.STORE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
        errorCode: ErrorCode.MEMBER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (member.role !== 'OWNER') {
      throw new ForbiddenException({
        message: 'You are not authorized to delete this store',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
    await this.storeRepo.deleteStore(storeId);
    return { success: true, message: 'Store deleted successfully' };
  }

  // Invitation logic
  async createInviteLink(storeId: number, userId: number) {
    const { token } = generateToken();
    const store = await this.storeRepo.findOne(storeId);
    if (!store) {
      throw new NotFoundException({
        message: 'Store not found',
        errorCode: ErrorCode.STORE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
        errorCode: ErrorCode.MEMBER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (member.role !== 'OWNER' && member.role !== 'MANAGER') {
      throw new ForbiddenException({
        message: 'You are not authorized to create invite link',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
    await this.storeRepo.createInviteLink(token, storeId);
    return { inviteCode: token };
  }

  async getInviteLink(storeId: number, userId: number) {
    const store = await this.storeRepo.findOne(storeId);
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
        errorCode: ErrorCode.MEMBER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (member.role !== 'OWNER' && member.role !== 'MANAGER') {
      throw new ForbiddenException({
        message: 'You are not authorized to get invite link',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
    return { inviteCode: store?.inviteCode };
  }

  async createInvitation(
    invitationDto: InvitationDto,
    storeId: number,
    userId: number,
  ) {
    const member = await this.memberRepo.findOne(storeId, userId);
    const user = await this.userRepo.findByEmail(invitationDto.email);
    let token = await this.getInviteLink(storeId, userId);

    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
        errorCode: ErrorCode.MEMBER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (member.role !== 'OWNER' && member.role !== 'MANAGER') {
      throw new ForbiddenException({
        message: 'You are not authorized to get invite link',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        errorCode: ErrorCode.USER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    if (member) {
      throw new ConflictException({
        message: 'User is already a member of the store',
        errorCode: ErrorCode.USER_ALREADY_EXISTS,
        statusCode: HttpStatus.CONFLICT,
      });
    }

    if (!token.inviteCode) {
      token = await this.createInviteLink(storeId, userId);
    }
    if (!token.inviteCode) {
      throw new NotFoundException({
        message: 'Invite link not found',
        errorCode: ErrorCode.INVALID_TOKEN,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const created = await this.memberRepo.createInvitation(
      user.userId,
      storeId,
      invitationDto.role as MemberRole,
    );
    await sendInvitationEmail(invitationDto.email, token.inviteCode);

    return { success: true, invitation: created };
  }

  async getInvitations(storeId: number, userId: number) {
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new NotFoundException({
        message: 'Member not found',
        errorCode: ErrorCode.MEMBER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (member.role !== 'OWNER' && member.role !== 'MANAGER') {
      throw new ForbiddenException({
        message: 'You are not authorized to get invite link',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
    const invitations = await this.storeRepo.getInvitations(storeId);
    return invitations.map(({ memberId, ...invitation }) => {
      return {
        invitationId: memberId,
        ...invitation,
      };
    });
  }

  async deleteInvitation(
    storeId: number,
    targetUserId: number,
    userId: number,
  ) {
    const targetMember = await this.memberRepo.findById(targetUserId);
    if (!targetMember) {
      throw new NotFoundException({
        message: 'Invitation not found',
        errorCode: ErrorCode.INVITATION_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const opMember = await this.memberRepo.findOne(storeId, userId);
    if (!opMember) {
      throw new NotFoundException({
        message: 'Member not found',
        errorCode: ErrorCode.MEMBER_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    if (opMember.role !== 'OWNER' && opMember.role !== 'MANAGER') {
      throw new ForbiddenException({
        message: 'You are not authorized to delete this invitation',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }
    return this.memberRepo.deleteMember(storeId, targetMember.userId);
  }

  // Get Store Info
  async getStoreInfo(storeId: number, userId: number) {
    const store = await this.storeRepo.findOne(storeId);
    if (!store) {
      throw new NotFoundException({
        message: 'Store not found',
        errorCode: ErrorCode.STORE_NOT_FOUND,
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    const member = await this.memberRepo.findOne(storeId, userId);
    if (!member) {
      throw new ForbiddenException({
        message: 'You are not a member of this store',
        errorCode: ErrorCode.INSUFFICIENT_PERMISSIONS,
        statusCode: HttpStatus.FORBIDDEN,
      });
    }

    const memberCount = await this.memberRepo.getMemberCount(storeId);
    const productsCount = await this.productRepo.getProductCount(storeId);

    return { storeId: store.storeId, memberCount, productsCount };
  }
}
