import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OrganizationsService } from '../organizations/organizations.service';
import { BotsService } from '../bots/bots.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private orgsService: OrganizationsService,
    private botsService: BotsService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
    });

    // Bootstrap the organization for this new account
    await this.orgsService.createForUser(
      user._id.toString(),
      dto.name,
      dto.email,
    );

    // Re-fetch to get the newly set organizationId
    const freshUser = await this.userModel.findById(user._id).exec();

    // Create a starter example bot for the new account
    await this.botsService.create(
      {
        name: 'Meu Primeiro Bot',
        description: 'Bot de exemplo criado automaticamente. Explore o builder para personalizá-lo!',
        language: 'pt',
      },
      freshUser!._id.toString(),
      freshUser!.organizationId?.toString(),
    );
    const { password: _, ...userObj } = freshUser!.toObject();
    return { user: userObj, accessToken: this.signToken(freshUser!) };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+password')
      .exec();
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { password: _, ...userObj } = user.toObject();
    return { user: userObj, accessToken: this.signToken(user) };
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  private signToken(user: UserDocument): string {
    return this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId?.toString(),
    });
  }
}
