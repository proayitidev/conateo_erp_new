import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentsService } from './documents.service.js';
import { UpdateDocumentDto } from './dto/update-document.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';
import { SearchDocumentDto } from './dto/search-document.dto.js';
import {
  GetUser,
  GetUserDocumentAccess,
} from '../auth/decorators/getUser.decorator.js';
import { PermissionGuard } from '../auth/guard/permission.guard.js';
import { PermissionsCheck } from '../auth/decorators/permission.decorator.js';
import { $Enums } from '../utils/prisma/client.js';
@PermissionsCheck({
  privilege: {
    code: 'PRIV_DOCUMENTS',
    permissions: [$Enums.AccessLevel.READ],
  },
})
@ApiBearerAuth()
@UseGuards(JwtGuard, PermissionGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('types')
  findAllTypes(@GetUser('affectationId') organisationUnitId: number) {
    return this.documentsService.findAllTypes(organisationUnitId);
  }

  @Get()
  findAll(
    @GetUser('organisationUnitId') organisationUnitId: number,
    @GetUser('id') userId: number,
    @GetUserDocumentAccess({ permissions: ['READ'] }) documentAccess: string[],
    @Query(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )
    query: SearchDocumentDto,
  ) {
    return this.documentsService.findAll(
      userId,
      organisationUnitId,
      query,
      documentAccess,
    );
  }

  @Get('summary')
  summary(
    @GetUser('organisationUnitId') organisationUnitId: number,
    @GetUserDocumentAccess({ permissions: ['READ'] }) documentAccess: string[],
    @Query('groupBy') query: any,
    @Query('include') include: any,
  ) {
    return this.documentsService.summary(
      organisationUnitId,
      documentAccess,
      query,
      include,
    );
  }

  @Get('summaryByDate')
  summaryByDate(@GetUser('organisationUnitId') organisationUnitId: number) {
    return this.documentsService.summaryByDate(organisationUnitId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateDocumentDto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(+id, updateDocumentDto);
  }

  @PermissionsCheck({
    privilege: {
      code: 'Documents',
      permissions: [$Enums.AccessLevel.DELETE],
    },
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(+id);
  }
}
