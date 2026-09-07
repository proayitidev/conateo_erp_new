import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { NumberToWordsService } from "../number-to-words/number-to-words.service.js";
import type { IFileStorage } from "../file-manager/interface/file-manager.interface.js";
import moment from "moment";
import { basename } from "path";
import type { IPDFGenerator } from "../pdf-generator/interface/pdf-generator.interface.js";
import { Prisma, $Enums, Fees } from "../prisma/client.js";
import {createReport} from 'docx-templates';

@Injectable()
export class DocumentGeneratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly numberToWord: NumberToWordsService,
    @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage,
    @Inject('PDF_GENERATOR_SERVICE')
    private readonly pdfGeneratorService: IPDFGenerator,
  ) {}
  async generateMovementDocument(
    movementId: number,
    tx?: Prisma.TransactionClient,
  ) {
    try {
      const transactionRequest = tx ?? this.prisma;
      const { employee, documents, ...movementPersonel } =
        await transactionRequest.movementPersonel.findFirstOrThrow({
          where: {
            id: movementId,
          },
          include: {
            documents: {
              include: { type: true },
            },
            status: {
              include: {
                grade: {
                  include: { salaryGrid: true, fees: true },
                },
                affectation: true,
              },
            },
            employee: {
              include: {
                status: {
                  include: {
                    grade: {
                      include: { salaryGrid: true, fees: true },
                    },
                    affectation: true,
                  },
                },
                movements: {
                  where: {
                    approved: true,
                    id: {
                      not: movementId,
                    },
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                  include: {
                    status: {
                      include: { grade: true },
                    },
                  },
                },
              },
            },
          },
        });
      if (!documents || !documents.type.template)
        throw new NotFoundException(['doc not found']);

      if (!employee) throw new NotFoundException(['Employee not found ']);

      const templateFile = (await this.fileManager.getFile(
        {
          file: {
            fileName: documents.type.template,
            directory: 'templates',
          },
        },
        true,
      )) as Buffer;

      const currentStatus = movementPersonel.status ?? employee.status;

      if (!currentStatus)
        throw new NotFoundException(['No current Status for this agent']);

      // TODO replace with initial salary
      const salaire = currentStatus.initialSalary ?? 20000;

      const dire = await transactionRequest.affectation.findFirst({
        where: {
          type: 'DIRECTION',
          name: 'Générale',
        },
        select: {
          leader: {
            select: {
              firstName: true,
              lastName: true,
              nif: true,
              ninu: true,
            },
          },
        },
      });

      const buffer = await createReport({
        template: templateFile,
        data: {
          ...employee,
          ...currentStatus,
          salaire,
          title: this.getTitle(employee.sexe),
          currentExercice: this.getFiscaleYear(),
          fees: this.getFees(currentStatus.grade.fees, salaire),
          currentGrade: currentStatus.grade.name,
          getPrevGrade: () => {
            if (employee.movements.length > 0) {
              return employee.movements[0].status.grade.name;
            }
            return '';
          },
        },
        cmdDelimiter: ['{', '}'],
        additionalJsContext: {
          isConsultant: (): boolean => {
            return false;
          },
          formatCurrency: (value: number) => this.formatCurrency(value),
          getNumberInWords: (num: number, isCurrency: boolean = true) => {
            return this.numberToWord.convertToWordsFrench(num, isCurrency);
          },
          formatDate: (date: Date, format?: string) => {
            return moment(date).format(format).trim();
          },
          getPrevFonctionFunction: () => {
            return '';
          },
          getDate: (
            format?: string,
            operationValue?: number,
            operation?: string,
            operationOn?: moment.DurationInputArg2,
          ) => this.getDate(format, operationValue, operation, operationOn),
          //get Employee start fiscal year
          getESFY: () => this.getESFY(employee.createdAt),
          getDirectreurGeneral: () => {
            return dire?.leader;
          },
          getContractDuration: () => {
            if (movementPersonel.startDate && movementPersonel.endDate) {
              const start = moment(movementPersonel.startDate);
              const end = moment(movementPersonel.endDate);
              const diff = end.diff(start, 'month');
              return diff;
            }
          },
        },
      });

      const pathPdf = await this.pdfGeneratorService.toPDF(
        Buffer.from(buffer),
        {
          fileName: documents.code + '.docx',
          directory: 'numerisation',
        },
      );
      const path = basename(pathPdf);

      await transactionRequest.documents.update({
        where: {
          id: documents.id,
        },
        data: {
          path: path,
        },
      });

      return path;
    } catch (error) {
      console.log(' the error', error);
      throw error;
    }
  }
  async generateLeave(leaveId: number, tx?: Prisma.TransactionClient) {
    try {
      const transactionRequest = tx ?? this.prisma;
      const { employee, document, ...leaveRequest } =
        await transactionRequest.employeeLeavesRequest.findUniqueOrThrow({
          where: {
            id: leaveId,
          },
          include: {
            document: {
              include: { type: true },
            },
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                status: {
                  select: {
                    grade: {
                      include: { salaryGrid: true, fees: true },
                    },
                    affectation: true,
                  },
                },
              },
            },
          },
        });

      console.log('the oocsdada', document);
      if (!document || !document.type.template)
        throw new NotFoundException(['doc not found']);

      if (!employee) throw new NotFoundException(['Employee not found ']);

      const templateFile = (await this.fileManager.getFile(
        {
          file: {
            fileName: document.type.template,
            directory: 'templates',
          },
        },
        true,
      )) as Buffer;

      const currentStatus = employee.status;
      if (!currentStatus)
        throw new NotFoundException(['No current Status for this agent']);

      const dire = await transactionRequest.affectation.findFirst({
        where: {
          type: 'DIRECTION',
          name: 'Générale',
        },
        select: {
          leader: {
            select: {
              firstName: true,
              lastName: true,
              nif: true,
              ninu: true,
            },
          },
        },
      });
      const employeeLeaveStatus =
        await transactionRequest.employeeLeaveStatus.findFirst({
          where: {
            employeeId: employee.id,
            policyType: leaveRequest.type,
          },
        });

      const buffer = await createReport({
        template: templateFile,
        data: {
          ...employee,
          ...currentStatus,
          ...leaveRequest,
          returnDate: moment(leaveRequest.endDate)
            .add(1, 'days')
            .format('DD/MM/YYYY'),
          type: employeeLeaveStatus?.policyType,
          total: employeeLeaveStatus?.newDays,
          requested: leaveRequest.daysRequested,
          prev: employeeLeaveStatus?.carryOverAvailable,
          remaining: employeeLeaveStatus?.currentBalance,
          currentExercice: this.getFiscaleYear(),
          currentGrade: currentStatus.grade.name,
        },
        cmdDelimiter: ['{', '}'],
        additionalJsContext: {
          formatCurrency: (value: number) => this.formatCurrency(value),
          getNumberInWords: (num: number, isCurrency: boolean = true) => {
            return this.numberToWord.convertToWordsFrench(num, isCurrency);
          },
          formatDate: (date: Date, format?: string) => {
            return moment(date).format(format).trim();
          },
          getPrevFonctionFunction: () => {
            return '';
          },
          getDate: (
            format?: string,
            operationValue?: number,
            operation?: string,
            operationOn?: moment.DurationInputArg2,
          ) => this.getDate(format, operationValue, operation, operationOn),

          getDirectreurGeneral: () => {
            return dire?.leader;
          },
        },
      });

      const pathPdf = await this.pdfGeneratorService.toPDF(
        Buffer.from(buffer),
        {
          fileName: document.code + '.docx',
          directory: 'numerisation',
        },
      );
      const path = basename(pathPdf);

      await transactionRequest.documents.update({
        where: {
          id: document.id,
        },
        data: {
          path: path,
        },
      });
      return path;
    } catch (error) {
      console.log(' the error', error);
      throw error;
    }
  }
  async generateAttestation(
    attestationId: number,
    tx?: Prisma.TransactionClient,
  ) {
    try {
      const transactionRequest = tx ?? this.prisma;
      const { employee, document } =
        await transactionRequest.attestationRequest.findUniqueOrThrow({
          where: {
            id: attestationId,
          },
          include: {
            document: {
              include: { type: true },
            },
            employee: {
              select: {
                id: true,
                sexe: true,
                nif: true,
                firstName: true,
                lastName: true,
                hireDate: true,
                status: {
                  include: {
                    grade: {
                      include: { salaryGrid: true, fees: true },
                    },
                    affectation: true,
                  },
                },
              },
            },
          },
        });

      if (!document || !document.type.template)
        throw new NotFoundException([
          'Template not found for this document type',
        ]);

      if (!employee) throw new NotFoundException(['Employee not found ']);

      const templateFile = (await this.fileManager.getFile(
        {
          file: {
            fileName: document.type.template,
            directory: 'templates',
          },
        },
        true,
      )) as Buffer;

      const currentStatus = employee.status;
      if (!currentStatus)
        throw new NotFoundException(['No current Status for this agent']);
      if (!employee.hireDate) {
        throw new NotFoundException(['Employee hire date not found']);
      }
      const dirRH = await transactionRequest.affectation.findFirst({
        where: {
          type: 'DIRECTION',
          sigle: 'DARH',
          leaderId: {
            not: null,
          },
        },
        select: {
          leader: {
            select: {
              firstName: true,
              lastName: true,
              nif: true,
              ninu: true,
            },
          },
        },
      });
      const dirAdmin = await transactionRequest.affectation.findFirst({
        where: {
          type: 'DIRECTION',
          sigle: 'DA',
          leaderId: {
            not: null,
          },
        },
        select: {
          leader: {
            select: {
              firstName: true,
              lastName: true,
              nif: true,
              ninu: true,
            },
          },
        },
      });

      if (!dirRH || !dirAdmin) {
        throw new NotFoundException(
          'Pleace check if the Direcrion RH and Admin are well defined',
        );
      }

      const buffer = await createReport({
        template: templateFile,
        data: {
          title: this.getTitle(employee.sexe),
          ...employee,

          currentExercice: this.getFiscaleYear(),
          grade: currentStatus.grade.name,
          affectation: currentStatus.affectation.name,
          salaire: currentStatus.initialSalary,
          fees: currentStatus.grade.fees.reduce((result: number, current) => {
            if (current.type != 'ASSURANCE') {
              result +=
                current.amount *
                (current.amountType == $Enums.AmountType.FIXED
                  ? 1
                  : currentStatus.initialSalary / 100);
            }
            return result;
          }, 0),
        },
        cmdDelimiter: ['{', '}'],
        additionalJsContext: {
          formatCurrency: (value: number) => this.formatCurrency(value),
          getNumberInWords: (num: number, isCurrency: boolean = true) => {
            return this.numberToWord.convertToWordsFrench(num, isCurrency);
          },
          dirAdmin: () => {
            return `${dirAdmin.leader?.firstName} ${dirAdmin.leader?.lastName?.toUpperCase()}`;
          },
          dirRH: () => {
            return `${dirRH.leader?.firstName} ${dirRH.leader?.lastName.toUpperCase()}`;
          },
          getESFY: () => {
            if (!employee.hireDate) {
              throw new NotFoundException(['Employee hire date not found']);
            }
            return this.getESFY(employee.hireDate);
          },

          formatDate: (date: Date, format?: string) => {
            return moment(date).format(format).trim();
          },
          getPrevFonctionFunction: () => {
            return '';
          },
          getDate: (
            format?: string,
            operationValue?: number,
            operation?: string,
            operationOn?: moment.DurationInputArg2,
          ) => this.getDate(format, operationValue, operation, operationOn),
        },
      });

      const pathPdf = await this.pdfGeneratorService.toPDF(
        Buffer.from(buffer),
        {
          fileName: document.code + '.docx',
          directory: 'numerisation',
        },
      );
      const path = basename(pathPdf);

      await transactionRequest.documents.update({
        where: {
          id: document.id,
        },
        data: {
          path: path,
        },
      });
      return path;
    } catch (error) {
      console.log(' the error', error);
      throw error;
    }
  }
  private getTitle(sexe: $Enums.Sexe) {
    return sexe == $Enums.Sexe.M ? 'Monsieur' : 'Madame';
  }
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      // 'en-US' locale typically uses comma for thousands, period for decimals
      minimumFractionDigits: 2, // Ensure at least 2 decimal places
      maximumFractionDigits: 2, // Ensure at most 2 decimal places (fixed to 2)
      useGrouping: true, // Enable thousands separators (e.g., 1,000)
    }).format(value);
  }
  private getSalaire(salaire: number, format: boolean = false) {
    if (format) {
      return new Intl.NumberFormat('en-US', {
        // 'en-US' locale typically uses comma for thousands, period for decimals
        minimumFractionDigits: 2, // Ensure at least 2 decimal places
        maximumFractionDigits: 2, // Ensure at most 2 decimal places (fixed to 2)
        useGrouping: true, // Enable thousands separators (e.g., 1,000)
      }).format(salaire);
    }
    return salaire;
  }
  getNumberInWords(num: number) {
    return this.numberToWord.convertToWordsFrench(num);
  }
  private getDate(
    format?: string,
    operationValue?: number,
    operation?: string,
    operationOn?: moment.DurationInputArg2,
  ) {
    let date = moment();
    if (operationValue && operation && operationOn) {
      if (operation == 'add') {
        date = date.add(operationValue, operationOn);
      } else if (operation == 'sub') {
        date = date.subtract(operationValue, operationOn);
      }
    }

    return date.format(format).trim();
  }
  private getFiscaleYear() {
    const date = new Date();
    const thisYear = date.getFullYear();
    const month = date.getMonth();
    if (month >= 9) {
      return thisYear + '-' + (thisYear + 1);
    } else {
      return thisYear - 1 + '-' + thisYear;
    }
  }
  //get Employee start fiscal year
  private getESFY(date: Date) {
    const thisYear = date.getFullYear();
    const month = date.getMonth();

    if (month >= 9) {
      return thisYear + '-' + (thisYear + 1);
    } else {
      return thisYear - 1 + '-' + thisYear;
    }
  }
  private getFees(fees: Fees[], salaire: number, format: boolean = false) {
    const empSalaireBrut = salaire;
    const totalFees = fees.reduce((result, current) => {
      result +=
        current.amount *
        (current.amountType == $Enums.AmountType.FIXED
          ? 1
          : empSalaireBrut / 100);
      return result;
    }, 0);
    if (format) {
      return new Intl.NumberFormat('en-US', {
        // 'en-US' locale typically uses comma for thousands, period for decimals
        minimumFractionDigits: 2, // Ensure at least 2 decimal places
        maximumFractionDigits: 2, // Ensure at most 2 decimal places (fixed to 2)
        useGrouping: true, // Enable thousands separators (e.g., 1,000)
      }).format(totalFees);
    }
    return totalFees;
  }
}
