import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsEmail({}, { message: 'O formato do e-mail é inválido' })
  email!: string;

  @IsString({ message: 'A senha deve ser um texto' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password!: string;
}

export class RegisterUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}