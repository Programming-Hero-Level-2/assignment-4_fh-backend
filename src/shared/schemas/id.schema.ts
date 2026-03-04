import z from 'zod';

export const IDSchema = z.uuid();

export type IDParams = z.infer<typeof IDSchema>;
