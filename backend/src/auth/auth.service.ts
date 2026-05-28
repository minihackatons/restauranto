import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/models/user.entity';
import { AuthCredentialsDto, RegisterUserDto } from 'src/dtos/auth.dto';
import { genSalt, hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(credentials: RegisterUserDto){
    let {name, email, password} = credentials;

    const userExists = await this.userRepository.findOne({where: {email}});

    if (userExists){
        throw new ConflictException("Usuário com este email já existe!");
    }

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const user = this.userRepository.create({
        name,
        email,
        password: hashedPassword
    })

    await this.userRepository.save(user);
  }

  async login (credentials: AuthCredentialsDto){
    let {email, password} = credentials;

    const user = await this.userRepository.findOne({where: {email}})

    if (!user){
        throw new NotFoundException('Usuário com este email não existe. Realize o cadastro.');
    }

    const passwordsMatch = await compare(password, user.password);

    if (!passwordsMatch){
        throw new UnauthorizedException("A senha inserida é incorreta.")
    }

    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    }

    const accessToken = await this.jwtService.sign(payload);

    return {accessToken};
  }
}
