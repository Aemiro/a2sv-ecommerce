import { FileDto } from './file-dto';

export class CurrentUserDto {
  id: string;
  email?: string;
  name: string;
  gender?: string;
  profilePicture?: FileDto;
  roles?: string[];
}
