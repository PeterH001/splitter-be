import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDTO, SignupDTO } from './dto';
import { RolesGuard } from './guard';

@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignupDTO) {
    return this.authService.signupUser(dto);
  }

  @Post('/admin/signup')
  @HttpCode(HttpStatus.CREATED)
  signupAdmin(@Body() dto: SignupDTO) {
    return this.authService.signupAdmin(dto);
  }
  
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: SigninDTO) {
    return this.authService.login(dto);
  }
}
