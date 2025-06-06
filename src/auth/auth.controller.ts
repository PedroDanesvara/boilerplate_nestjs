import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Autenticação')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'Usuário cadastrado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('signin')
  @ApiBody({ type: SigninDto })
  @ApiResponse({ status: 201, description: 'Login realizado com sucesso.' })
  @ApiResponse({ status: 401, description: 'E-mail ou senha inválidos.' })
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }
}
