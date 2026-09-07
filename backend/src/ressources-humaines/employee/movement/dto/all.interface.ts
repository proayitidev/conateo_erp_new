export interface MovementFiles {
  agentAvatar: Express.Multer.File;
  agentCV: Express.Multer.File[]; // Multer puts single files in an array too
  formationScans: Express.Multer.File[];
}
