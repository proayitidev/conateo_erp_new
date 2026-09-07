
import { IsEnum, IsInt, IsNotEmpty, IsNumber, Min } from "class-validator";
import { $Enums } from "../../../utils/prisma/client.js";


export class CreateFeeDto {
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    gradeId: number;

    @IsEnum($Enums.FeeType)
    @IsNotEmpty()
    type: $Enums.FeeType;

    @IsEnum($Enums.AmountType)
    @IsNotEmpty()
    amountType: $Enums.AmountType;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNumber()
    @IsNotEmpty()
    fiscalYear: number;
}
