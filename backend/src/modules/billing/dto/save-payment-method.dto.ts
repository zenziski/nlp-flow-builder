import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  ValidateNested,
} from 'class-validator';

export class CreditCardDto {
  @IsString()
  @IsNotEmpty()
  holderName: string;

  @IsString()
  @Length(13, 19)
  @Matches(/^\d+$/, { message: 'Card number must contain only digits' })
  number: string;

  @IsString()
  @Length(2, 2)
  @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Expiry month must be 01–12' })
  expiryMonth: string;

  @IsString()
  @Length(2, 4)
  @Matches(/^\d+$/, { message: 'Expiry year must contain only digits' })
  expiryYear: string;

  @IsString()
  @Length(3, 4)
  @Matches(/^\d+$/, { message: 'CVV must contain only digits' })
  ccv: string;
}

export class CardHolderInfoDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  /** CPF (11 digits) or CNPJ (14 digits) — digits only */
  @IsString()
  @Matches(/^\d{11}$|^\d{14}$/, { message: 'cpfCnpj must be an 11-digit CPF or 14-digit CNPJ' })
  cpfCnpj: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  addressNumber: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class SavePaymentMethodDto {
  @ValidateNested()
  @Type(() => CreditCardDto)
  card: CreditCardDto;

  @ValidateNested()
  @Type(() => CardHolderInfoDto)
  holderInfo: CardHolderInfoDto;
}
