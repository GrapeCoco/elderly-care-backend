declare module 'better-sqlite3' {
  export interface Database {
    prepare(sql: string): Statement;
    exec(sql: string): void;
    pragma(pragma: string): any;
    close(): void;
  }

  export interface Statement {
    run(...params: any[]): RunResult;
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }

  export interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  interface BetterSQLite3 {
    (filename: string, options?: any): Database;
  }

  const Database: BetterSQLite3;
  export = Database;
}
