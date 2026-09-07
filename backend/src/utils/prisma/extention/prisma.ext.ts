import { Prisma } from "../client.js";


export const paginationExtension = () => {
    return Prisma.defineExtension({
        name: 'pagination',
        model: {
            $allModels: {
                async findManyAndCount<T, A>(
                    this: T,
                    args?: Prisma.Exact<A, Prisma.Args<T, 'findMany'>>,
                ): Promise<{
                    data: Prisma.Result<T, A, 'findMany'>;
                    totalFiltered: number;
                    total: number;
                }> {
                    const context = Prisma.getExtensionContext(this);
                    const client = Prisma.getExtensionContext(this).$parent as any;

                    // Execute as a transaction to ensure consistency
                    const [data, totalFiltered, total] = await client.$transaction([
                        (context as any).findMany(args),
                        (context as any).count({ where: (args as any)?.where }),
                        (context as any).count(),
                    ]);

                    return {
                        data,
                        totalFiltered,
                        total,
                    };
                },
            },
        },
    });
};