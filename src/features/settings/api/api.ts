import { http } from '../../../shared/lib/api/http';

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const response = await http.post<ChangePasswordResponse>('/api/auth/change-password', data);
  return response.data;
}
