import { Controller, UseGuards } from '@nestjs/common';
import { MovementService } from './movement.service.js';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../../auth/guard/jwt.guard.js';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller()
export class MovementController {
  constructor(private readonly movementService: MovementService) { }
}
