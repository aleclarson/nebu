import { is } from '@alloc/is'
import { AllNodeProps } from './types'
import { replacers } from './mutation'
import { Node } from './Node'

export const NodeProperties = new Proxy(Object.prototype, {
  get(_, key: string, node) {
    let val = node.n[key]
    if (val) {
      if (val.type) {
        val = new Node(val, node, key)
        return replaceProp(node, key, val)
      }
      if (is.array(val)) {
        val = val.map(val => {
          return val && val.type //
            ? new Node(val, node, key)
            : val
        })
        return replaceProp(node, key, val)
      }
    }
    return val
  },
  set(_, key: string, value, node) {
    return setProp.call(node, key, value)
  },
})

function setProp(this: any, key: string, newValue: any) {
  const replacer: any = replacers[key as AllNodeProps]
  if (!replacer) {
    return false
  }
  replacer.call(this, this[key], newValue)
  replaceProp(this, key, newValue)
  return true
}

function replaceProp(node: any, key: string, value: any) {
  Object.defineProperty(node, key, {
    get: () => value,
    set: setProp.bind(node, key),
    enumerable: true,
    configurable: true,
  })
  return value
}
