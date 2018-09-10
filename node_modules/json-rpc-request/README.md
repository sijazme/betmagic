# JSON RPC 2.0 Request

Constructor for
[JSON RPC 2.0 request objects](http://www.jsonrpc.org/specification#request_object).

Also see related packages [json-rpc-response](https://github.com/claudijo/json-rpc-response),
[json-rpc-notification](https://github.com/claudijo/json-rpc-notification), and
[json-rpc-error](https://github.com/claudijo/json-rpc-error)

## Installation

```js
npm install json-rpc-request
```

## Usage

```js
new JsonRpcRequest(id, method[, params]);
```

Request objects can be constructed with or without using the `new` keyword.

### Example

```js
var JsonRpcRequest = require('json-rpc-request');

// Request with params
new JsonRpcRequest(1, 'subtract', [42, 23]);

// Request without params
new JsonRpcRequest(2, 'ping');
```

## Test

Run unit tests;

`$ npm test`

# License

[MIT](LICENSE)
