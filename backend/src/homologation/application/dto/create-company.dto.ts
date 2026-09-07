import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string; // Nom Entreprise [cite: 16, 29]

  @IsString()
  country: string; // Pays [cite: 16, 30]

  @IsString()
  city: string; // Ville [cite: 24, 32]

  @IsString()
  address: string; // Adresse [cite: 19, 34]

  @IsString()
  @IsNotEmpty()
  contactName: string; // Nom Contact [cite: 20, 35]

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string; // Email Contact [cite: 22, 37]

  @IsString()
  @IsOptional()
  contactPhone?: string; // Tél. Contact [cite: 25, 39]
}
