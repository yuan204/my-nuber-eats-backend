import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserProfileInput } from './dtos/user-profile.dto';
import { User, UserRole } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  let userRepository: MockRepository<User>;
  let verificationRepository: MockRepository<Verification>;
  let jwtService: JwtService;
  let mailService: MailService;

  let mockUserRepository = () => ({
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    preload: jest.fn(),
  });
  let mockVerificationRepository = () => ({
    save: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  });
  let mockJwtService = () => ({
    sign: jest.fn(() => 'sign-token'),
  });
  let mockMailService = () => ({
    sendEmail: jest.fn(),
  });

  type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockVerificationRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
    verificationRepository = module.get<MockRepository<Verification>>(
      getRepositoryToken(Verification),
    );
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user', async () => {
      const user = {
        id: 1,
        email: '',
      };
      userRepository.findOneBy.mockResolvedValue(user);
      const result = await service.findById(1);
      expect(userRepository.findOneBy).toBeCalledTimes(1);
      expect(userRepository.findOneBy).toBeCalledWith({ id: 1 });
      expect(result).toBe(user);
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@test.com',
      password: '12345',
      role: UserRole.Client,
    };

    const verification = {
      code: 'code',
    };

    it('should throw expection if email has registered', () => {
      userRepository.findOneBy.mockResolvedValue(createUserDto);

      expect(() => service.create(createUserDto)).rejects.toThrow(
        'email is in used',
      );
    });

    it('should create account', async () => {
      userRepository.findOneBy.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createUserDto);
      userRepository.save.mockResolvedValue(createUserDto);
      verificationRepository.create.mockReturnValue(verification);
      verificationRepository.save.mockResolvedValue(verification);

      const result = await service.create(createUserDto);
      expect(userRepository.findOneBy).toBeCalledTimes(1);
      expect(userRepository.findOneBy).toBeCalledWith({
        email: createUserDto.email,
      });
      expect(userRepository.create).toBeCalledTimes(1);
      expect(userRepository.create).toBeCalledWith(createUserDto);
      expect(userRepository.save).toBeCalledTimes(1);
      expect(userRepository.save).toBeCalledWith(createUserDto);

      expect(verificationRepository.create).toBeCalledTimes(1);
      expect(verificationRepository.create).toBeCalledWith({
        user: createUserDto,
      });
      expect(verificationRepository.save).toBeCalledTimes(1);
      expect(verificationRepository.save).toBeCalledWith(verification);

      expect(mailService.sendEmail).toBeCalledTimes(1);
      expect(mailService.sendEmail).toBeCalledWith(
        createUserDto.email,
        verification.code,
      );

      expect(result).toBe(createUserDto);
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@test.com',
      password: '12345',
    };
    it('should throw exception if user does not exist', async () => {
      userRepository.findOneBy.mockResolvedValue(undefined);

      expect(() => service.login(loginArgs)).rejects.toThrow('not find email');
      expect(userRepository.findOneBy).toBeCalledTimes(1);
      expect(userRepository.findOneBy).toBeCalledWith({
        email: loginArgs.email,
      });
    });

    it('should throw exception if password wrong', () => {
      userRepository.findOneBy.mockResolvedValue({
        validatePassword: () => Promise.resolve(false),
      });
      expect(() => service.login(loginArgs)).rejects.toThrow('wrong password');
    });

    it('should user login success', async () => {
      const user = {
        id: 1,
        validatePassword: () => Promise.resolve(true),
      };
      userRepository.findOneBy.mockResolvedValue(user);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toBeCalledTimes(1);
      expect(jwtService.sign).toBeCalledWith({ sub: user.id });
      expect(result).toEqual({ token: 'sign-token', ...user });
    });
  });

  describe('update', () => {
    const oldUser = {
      id: 1,
      email: 'old@test.com',
      password: '12',
    };
    const updateArgs: UpdateUserProfileInput = {
      userId: 1,
      data: {
        email: 'new@test.com',
        password: '12345',
      },
    };
    const newUser = {
      id: 1,
      email: 'new@test.com',
      password: '12345',
    };
    it('should throw exception if user does not exist', () => {
      userRepository.preload.mockResolvedValue(false);
      expect(() => service.update(updateArgs)).rejects.toThrow(
        'not found user',
      );
      expect(userRepository.preload).toBeCalledTimes(1);
      expect(userRepository.preload).toBeCalledWith({
        id: updateArgs.userId,
        ...updateArgs.data,
      });
    });

    it('should change user email and user password', async () => {
      userRepository.preload.mockResolvedValue(newUser);
      userRepository.save.mockResolvedValue(newUser);

      const result = await service.update(updateArgs);
      expect(userRepository.preload).toBeCalledTimes(1);
      expect(userRepository.preload).toBeCalledWith(newUser);
      expect(userRepository.save).toBeCalledTimes(1);
      expect(userRepository.save).toBeCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });

  describe('verifyEmail', () => {
    const code = 'code';
    it('should throw exception if not found verifyication', () => {
      verificationRepository.findOne.mockResolvedValue(false);
      expect(() => service.verifyEmail(code)).rejects.toThrow(
        'not found verifyication',
      );
    });

    it('should verify email suceess', async () => {
      const verification = {
        user: {
          verifyed: false,
        },
      };
      verificationRepository.findOne.mockResolvedValue(verification);
      userRepository.save.mockResolvedValue({
        verifyed: true,
      });

      const result = await service.verifyEmail(code);
      expect(verificationRepository.findOne).toBeCalledTimes(1);
      expect(verificationRepository.findOne).toBeCalledWith({
        where: { code },
        relations: {
          user: true,
        },
      });
      expect(verificationRepository.remove).toBeCalledTimes(1);
      expect(verificationRepository.remove).toBeCalledWith(verification);
      expect(userRepository.save).toBeCalledTimes(1);
      expect(userRepository.save).toBeCalledWith({
        verifyed: true,
      });
      expect(result).toEqual({
        verifyed: true,
      });
    });
  });
});
