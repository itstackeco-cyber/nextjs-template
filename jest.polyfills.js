const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { fetch, Headers, Request, Response } = require("undici");
Object.assign(global, { fetch, Headers, Request, Response });
