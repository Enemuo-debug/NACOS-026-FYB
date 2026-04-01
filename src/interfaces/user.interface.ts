export enum UserRole {
  SUPER_USER = 'SUPER_USER',
  USER = 'USER'
}

export interface User {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isInvited: boolean;
  registrationToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserOutput {
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  IMAGE = 'IMAGE'
}

export interface FieldSlot {
  label?: string;
  type?: FieldType;
}
