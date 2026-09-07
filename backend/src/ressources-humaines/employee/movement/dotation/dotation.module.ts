import { Module } from '@nestjs/common';
import { DotationService } from './dotation.service.js';
import { DotationController } from './dotation.controller.js';
import { SignDocumentModule } from '../../../../utils/sign-document/sign-document.module.js';
import { EmployeeService } from '../../employee.service.js';
import { FormationService } from '../../formation/formation.service.js';

@Module({
  imports: [SignDocumentModule],
  controllers: [DotationController],
  providers: [DotationService, EmployeeService, FormationService],
  exports: [FormationService],
})
export class DotationModule {}
