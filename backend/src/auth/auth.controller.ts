import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthCredentialsDto, RegisterUserDto } from 'src/dtos/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: RegisterUserDto): Promise<any>{
    return this.authService.register(body);
  }

  @Post("login")
  async login(@Body() body: AuthCredentialsDto): Promise<any>{
    return this.authService.login(body);
  }
}
