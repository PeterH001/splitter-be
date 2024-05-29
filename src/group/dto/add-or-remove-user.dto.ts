import { IsNotEmpty, IsNumber, IsString,  } from "class-validator";

export class AddOrRemoveUserDTO {
    @IsNotEmpty()
    @IsNumber()
    id: number
}