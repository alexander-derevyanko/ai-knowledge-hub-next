import { IsEnum, IsInt, IsNotEmpty, IsString, IsUUID, Min } from 'class-validator';

import { DocumentCategory, DocumentType } from '../../generated/prisma/client.js';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(DocumentCategory)
  @IsNotEmpty()
  category!: DocumentCategory;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  type!: DocumentType;

  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;

  @IsUUID()
  @IsNotEmpty()
  organizationId!: string;
}
