import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { QueryStoreDto } from './dto/query-store.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { GetUser } from 'src/helper/decorator/user.decorator';
import { MemberGuard } from 'src/auth/guard/member.guard';
import { InvitationDto } from './dto/invitation.dto';

@UseGuards(JwtAuthGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get()
  findAll(@Query() query: QueryStoreDto, @GetUser('userId') userId: string) {
    return this.storesService.findAll(query, +userId);
  }

  @Post()
  createStore(
    @Body() createDto: CreateStoreDto,
    @GetUser('userId') userId: string,
  ) {
    return this.storesService.createStore(createDto, +userId);
  }

  @UseGuards(MemberGuard)
  @Get(':storeId')
  findOne(@Param('storeId') storeId: string) {
    return this.storesService.findOne(+storeId);
  }

  @Patch(':storeId')
  updateStore(
    @Body() updateDto: UpdateStoreDto,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.storesService.updateStore(updateDto, +storeId, +userId);
  }

  @Delete(':storeId')
  deleteStore(
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.storesService.deleteStore(+storeId, +userId);
  }

  // Invitation endpoint
  @Post(':storeId/invite-link')
  createInviteLink(
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.storesService.createInviteLink(+storeId, +userId);
  }

  @Get(':storeId/invite-link')
  getInviteLink(
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.storesService.getInviteLink(+storeId, +userId);
  }

  @Post(':storeId/invitations')
  createInvitation(
    @Body() invitationDto: InvitationDto,
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.storesService.createInvitation(
      invitationDto,
      +storeId,
      +userId,
    );
  }

  @Get(':storeId/invitations')
  getInvitations(
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.storesService.getInvitations(+storeId, +userId);
  }

  @Delete(':storeId/invitations/:invitationId')
  deleteInvitation(
    @GetUser('userId') userId: string,
    @Param('storeId') storeId: string,
    @Param('invitationId') invitationId: string,
  ) {
    return this.storesService.deleteInvitation(
      +storeId,
      +invitationId,
      +userId,
    );
  }

  // Get Store Info
  @Get(':storeId/info')
  getStoreInfo(
    @Param('storeId') storeId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.storesService.getStoreInfo(+storeId, +userId);
  }
}
