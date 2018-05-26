// Generated by CoffeeScript 2.3.0
var Walker, props;

props = require('./props');

Walker = class Walker {
  constructor(state, plugins) {
    this.state = state || {};
    this.plugins = plugins;
    this.stack = [];
    this.yielded = new Set;
  }

  // Depth-first traversal, parents first
  walk(node, parent, ref) {
    var j, len, ref1, visitor, visitors;
    if (node.stale) {
      return;
    }
    this.stack.push(node);
    if (parent) {
      node.parent = parent;
      node.ref = ref;
    }
    if (visitors = this.plugins[node.type]) {
      for (j = 0, len = visitors.length; j < len; j++) {
        visitor = visitors[j];
        visitor(node, this.state);
        if (node.stale) {
          return;
        }
      }
    }
    // Visit any children.
    this.descend(node);
    if (!node.stale) {
      if ((ref1 = node.yields) != null) {
        ref1.forEach(function(resume) {
          return resume();
        });
      }
    }
    this.stack.pop();
  }

  // Traverse deeper.
  descend(node) {
    var i, k, key, keys, val;
    k = -1;
    keys = props[node.type] || Object.keys(node);
    while (++k !== keys.length) {
      if (val = node[key = keys[k]]) {
        if (typeof val.type === 'string') {
          if (val !== node.parent) {
            this.walk(val, node, key);
            if (node.stale) {
              return;
            }
          }
        } else if (Array.isArray(val)) {
          i = -1;
          while (++i !== val.length) {
            this.walk(val[i], node, key);
            if (node.stale) {
              return;
            }
          }
        }
      }
    }
  }

  // Prevent traversal of a node and its descendants.
  drop(node) {
    var i, length, stack;
    ({stack} = this);
    i = stack.indexOf(node);
    if (i === -1) {
      node.stale = true;
      return;
    }
    ({length} = stack);
    while (true) {
      stack[i].stale = true;
      if (++i === length) {
        return;
      }
    }
  }

};

module.exports = Walker;
