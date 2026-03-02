import bcrypt from 'bcrypt';

export const generateHash = async (password: string, saltRound?: number) => {
  const salt = await bcrypt.genSalt(saltRound || 10);
  return bcrypt.hash(password, salt);
};

export const hashMatched = async (row: string, hash: string) => {
  return await bcrypt.compare(row, hash);
};
