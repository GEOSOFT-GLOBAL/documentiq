export interface IGoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export interface IAuthUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface IAuthResponse {
  user: IAuthUser;
  accessToken: string;
  refreshToken: string;
  googleUser?: IGoogleUser;
}