import { IsString } from 'class-validator';

export class CreateEquipmentDto {
  @IsString()
  type: string; // Type (ex: CR60 Light) [cite: 42]

  @IsString()
  brand: string; // Marque (ex: BOSCH) [cite: 42]

  @IsString()
  model: string; // Modèle (ex: C6ACOA) [cite: 44]

  @IsString()
  frequencies: string; // Fréquences (ex: 76-77Ghz) [cite: 42]

  @IsString()
  power: string; // Puissances (ex: 39 dBm) [cite: 42]

  @IsString()
  modulations: string; // Liste des noms de modulations (ex: FMCW) [cite: 42]
}
