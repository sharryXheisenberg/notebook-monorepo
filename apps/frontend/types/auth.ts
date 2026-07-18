export interface UserSummary {
  id: string;
  username: string;
}

export interface JwtAuthRes {
  token: string;
  user: UserSummary;
}

export interface RegisterReq {
  username: string;
  email: string;
  password: string;
}

export interface LoginReq {
  email: string;
  password: string;
}
