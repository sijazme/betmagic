var JsonRpcRequest = function(id, method, params) {
  if (!(this instanceof JsonRpcRequest)) {
    return new JsonRpcRequest(id, method, params);
  }

  if (typeof id !== 'string' && typeof id !== 'number') {
    throw new TypeError('Invalid id type ' + typeof id);
  }

  if (typeof method !== 'string') {
    throw new Error('Invalid method');
  }

  this.jsonrpc = '2.0';
  this.id = id;
  this.method = method;

  if (typeof params !== 'undefined') {
    this.params = params;
  }


};

module.exports = JsonRpcRequest;
