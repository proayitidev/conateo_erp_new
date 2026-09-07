import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HomologationService } from './homologation.service.js';
import { CreateHomologationDto } from './application/dto/create-homologation.dto.js';
import { UpdateHomologationDto } from './dto/update-homologation.dto.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt.guard.js';

// @ApiBearerAuth()
// @UseGuards(JwtGuard)
@Controller('homologation')
export class HomologationController {
  constructor(private readonly homologationService: HomologationService) { }

}
