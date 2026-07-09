export class financeRecordDto {
    type!: 'INCOME' | 'EXPENSE';
    category!: 'ORDER' | 'STOCK' | 'OTHER';
    description!: string;
    value!: number;   
}