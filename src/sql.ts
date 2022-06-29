import { api } from './api';

export const getTables = async (connectionId: string): Promise<string[]> => {
  const result = await api.executeQuery(connectionId, 'SHOW TABLES');

  if (!result) {
    return [];
  }

  const tablesCol = result.columns[0].name;

  return result.rows.map((row) => String(row[tablesCol]));
};
