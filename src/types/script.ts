export interface Script {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScriptDto {
  name: string;
}

export interface UpdateScriptDto {
  name: string;
}

export interface ScriptLicensesResponse {
  script: string;
  quantity: number;
  licenses: any[];
}
