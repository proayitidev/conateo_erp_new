import { PartialType } from '@nestjs/swagger';
import { SearchDocumentDto } from './search-document.dto.js';

export class UpdateDocumentDto extends PartialType(SearchDocumentDto) {}
