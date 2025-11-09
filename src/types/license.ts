export interface License {
  _id: string;
  token: string;
  scriptName: string;
  userDiscord: string;
  createdAt: string;
  expiresAt?: string;
  ipPort?: string;
  isPermanent: boolean;
  updatedAt: string;
}

export interface CreateLicenseDto {
  scriptId: string;
  userDiscord: string;
  expiresInDays?: number;
}

export interface UpdateIpDto {
  ipPort: string;
}

export interface ModifyDaysDto {
  days: number;
}
