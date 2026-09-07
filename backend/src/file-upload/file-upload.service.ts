import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type { IFileStorage } from '../utils/file-manager/interface/file-manager.interface.js';
import path from 'path';
import { successWrapper } from '../utils/common/successwrapper.js'
import { ErrorHandlerService } from '../utils/error-handler/error-handler.service.js';


@Injectable()
export class FileUploadService {
    constructor(
        private readonly errorHandler: ErrorHandlerService,
        @Inject('FILE_MANAGER_SERVICE') private readonly fileManager: IFileStorage
    ) { }

    async uploadTemplate(file: Express.Multer.File) {
        try {
            const newTemplatePath =
                'temp_file_' + path.extname(file.originalname);
            const uploadedFile = await this.fileManager.updateFileToRoot({
                buffer: file.buffer,
                directory: 'temp_files',
                fileName: newTemplatePath,
            });
            return successWrapper(HttpStatus.OK, "File_uploaded", path.basename(uploadedFile))
        } catch (error: any) {
            return this.errorHandler.handleError(error)
        }
    }
}
