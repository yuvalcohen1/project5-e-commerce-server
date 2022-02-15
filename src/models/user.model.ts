export interface UserModel {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  idNum: number;
  encryptedPassword: string;
  isAdmin: number;
  city: string;
  street: string;
}
