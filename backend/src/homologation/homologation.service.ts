import { Injectable } from '@nestjs/common';
import { CreateHomologationDto } from './application/dto/create-homologation.dto.js';
import { UpdateHomologationDto } from './dto/update-homologation.dto.js';
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';
import { PrismaService } from '../utils/prisma/prisma.service.js';

@Injectable()
export class HomologationService {
  constructor(private readonly errorHandler: ErrorHandlerService,
    private readonly prisma: PrismaService
  ) { }

  async create(createHomologationDto: CreateHomologationDto) {
    try {
      // // const homologation = await this.prisma.homologationApplication.create({
      // //   data: createHomologationDto
      // // });
      // return homologation;
    } catch (error) {
      return this.errorHandler.handleError(error);
    }
  }

  findAll() {
    return `This action returns all homologation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} homologation`;
  }

  update(id: number, updateHomologationDto: UpdateHomologationDto) {
    return `This action updates a #${id} homologation`;
  }

  remove(id: number) {
    return `This action removes a #${id} homologation`;
  }
}
