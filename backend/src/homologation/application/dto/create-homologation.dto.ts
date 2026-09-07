import { IsNotEmpty, IsOptional, IsString, validate, ValidateNested } from "class-validator";



export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    country!: string;

    @IsString()
    @IsNotEmpty()
    city!: string;

    @IsString()
    @IsNotEmpty()
    address!: string;

    @IsOptional()
    @IsString()
    contactName?: string;

    @IsOptional()
    @IsString()
    contactEmail?: string;

    @IsOptional()
    @IsString()
    contactPhone?: string;
}

export class EquipementDto {
    @IsString()
    @IsNotEmpty()
    type!: string;

    @IsString()
    @IsNotEmpty()
    brand!: string;

    @IsString()
    @IsNotEmpty()
    model!: string;

    @IsString()
    @IsNotEmpty()
    frequencies?: string;

    @IsString()
    power?: string;

    @IsString()
    modulations?: string;
}
export class HomologationDocumentDto {
    @IsString()
    @IsOptional()
    technicalSpecs?: string;

    @IsString()
    @IsOptional()
    testReports?: string;

    @IsString()
    @IsNotEmpty()
    fccCECertificate!: string;

    @IsString()
    @IsNotEmpty()
    photoEquipement!: string;
}

export class CreateHomologationDto {
    @ValidateNested()
    manufacturer!: CreateCompanyDto;

    @ValidateNested()
    representative!: CreateCompanyDto

    @ValidateNested()
    documents!: HomologationDocumentDto;

    @ValidateNested()
    equipment!: EquipementDto
}
