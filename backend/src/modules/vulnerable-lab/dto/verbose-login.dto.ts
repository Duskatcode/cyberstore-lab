import { IsEmail, IsString } from 'class-validator';

export class VerboseLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
