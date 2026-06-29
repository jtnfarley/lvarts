declare module 'ssh2-sftp-client' {
    export interface ConnectOptions {
        host: string;
        port?: number;
        username: string;
        password?: string;
        privateKey?: string | Buffer;
        passphrase?: string;
    }

    export default class SftpClient {
        connect(options: ConnectOptions): Promise<void>;
        put(input: Buffer | Uint8Array | string, remotePath: string): Promise<unknown>;
        end(): Promise<void>;
    }
}
