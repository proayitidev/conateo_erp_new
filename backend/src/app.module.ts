import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ServeStaticModule } from '@nestjs/serve-static';
import { env } from "prisma/config";
import { Module } from "@nestjs/common";
import { join } from "path";
import { FeesModule } from "./administration/fees/fees.module.js";
import { GradeModule } from "./administration/grade/grade.module.js";
import { HolidaysModule } from "./administration/holidays/holidays.module.js";
import { LeavePolicyModule } from "./administration/leave-policy/leave-policy.module.js";
import { PrivilegesModule } from "./administration/privileges/privileges.module.js";
import { RoleModule } from "./administration/role/role.module.js";
import { SalaryGridModule } from "./administration/salary-grid/salary-grid.module.js";
import { UserLogsModule } from "./administration/user-logs/user-logs.module.js";
import { AffectationModule } from "./affectation/affectation.module.js";
import { AppModuleModule } from "./app-module/app-module.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { CftdcModule } from "./cftdc/cftdc.module.js";
import { ControlPresenceModule } from "./control-presence/control-presence.module.js";
import { DeemModule } from "./deem/deem.module.js";
import { DocumentsModule } from "./documents/documents.module.js";
import { FileUploadModule } from "./file-upload/file-upload.module.js";
import { HomologationModule } from "./homologation/homologation.module.js";
import { PersonalManagementModule } from "./personal-management/personal-management.module.js";
import { RadioCommunicationModule } from "./radio-communication/radio-communication.module.js";
import { RessourcesHumainesModule } from "./ressources-humaines/ressources-humaines.module.js";
import { UsersModule } from "./users/users.module.js";
import { CryptrModule } from "./utils/cryptr/cryptr.module.js";
import { DocumentGeneratorModule } from "./utils/document-generator/document-generator.module.js";
import { ErrorHandlerModule } from "./utils/error-handler/error-handler.module.js";
import { FileManagerModule } from "./utils/file-manager/file-manager.module.js";
import { PrismaModule } from "./utils/prisma/prisma.module.js";
import { TaskModule } from "./utils/task/task.module.js";

const isVercel = !!process.env.BLOB_READ_WRITE_TOKEN;
console.log('its vercel', isVercel);
const rooFilePath = env('DIRECTORY_PATH'); //  join(__dirname, '..', '..', '..', 'uploads');
const rootWebDirectory = join(process.cwd(), 'public');
console.log('the roo directory', rootWebDirectory);
const staticModules = [
  // Always keep the frontend static root
  ServeStaticModule.forRoot({
    rootPath: rootWebDirectory,
    exclude: ['/api/{*text}'],
    serveStaticOptions: {
      index: 'index.html',
      cacheControl: true,
    },
  }),
];
if (!isVercel) {
  staticModules.push(
    ServeStaticModule.forRoot({
      rootPath: join(rooFilePath, 'avatar'),
      serveRoot: '/files/avatar',
      useGlobalPrefix: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(rooFilePath, 'images'),
      serveRoot: '/files/images',
      useGlobalPrefix: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(rooFilePath, 'numerisation'),
      serveRoot: '/files/document',
      useGlobalPrefix: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(rooFilePath, 'homologation'),
      serveRoot: '/files/homologation',
      useGlobalPrefix: true,
    }),
  );
}
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    ...staticModules,
    ScheduleModule.forRoot(),

    // Global Module
    CryptrModule,
    PrismaModule,
    ErrorHandlerModule,
    FileManagerModule,
    DocumentGeneratorModule,
    TaskModule,

    // Modules
    AuthModule,
    UsersModule,
    RoleModule,
    PrivilegesModule,
    UserLogsModule,
    RessourcesHumainesModule,
    // EmployeeModule,
    AffectationModule,
    // MovementModule,
    GradeModule,
    SalaryGridModule,
    ControlPresenceModule,
    HomologationModule,
    DeemModule,
    DocumentsModule,
    LeavePolicyModule,
    AppModuleModule,
    PersonalManagementModule,
    HolidaysModule,
    FeesModule,
    CftdcModule,
    FileUploadModule,
    RadioCommunicationModule,
    // SignDocumentModule
  ], // Registers both authentication and user modules
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(StaticAuthMiddleware)
//       .forRoutes({ path: 'document/*', method: RequestMethod.GET });
//   }
// }
