import { api } from './api';

const getTables = async (connectionId: string): Promise<string[]> => {
  const result = await api.executeQuery(connectionId, 'SHOW TABLES');

  const tablesCol = result.columns[0].name;

  return result.rows.map((row) => String(row[tablesCol]));
};

export const sql = {
  getTables,
};
