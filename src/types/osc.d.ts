declare module 'osc' {
    import type { EventEmitter } from 'events';

    export type Address = string;

    export type TypeTag =
        | 'i'
        | 'h'
        | 'f'
        | 's'
        | 'S'
        | 'b'
        | 't'
        | 'T'
        | 'F'
        | 'N'
        | 'I'
        | 'd'
        | 'c'
        | 'r'
        | 'm';

    export type Argument = RawArgument | TypeAnnotatedArgument;

    export type RawArgument = any;

    export type TypeAnnotatedArgument = {
        type?: TypeTag;
        value: RawArgument;
    };

    export type Packet = Message | Bundle;

    export type Message = {
        address: Address;
        args: Argument[];
    };

    export type TimeTag = [number, number];

    export type Bundle = {
        timeTag: TimeTag;
        packets: Packet[];
    };

    declare class SLIPPort extends EventEmitter {
        constructor(options: object);
    }

    export declare class TCPSocketPort extends SLIPPort {
        constructor(options?: object);

        open(address?: string, port?: number): void;
        close(): void;
        listen(): void;

        send(oscPacket: Packet): void;
        sendRaw(encoded: any): void;
    }
}
