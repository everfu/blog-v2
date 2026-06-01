import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

type DirectiveNode = {
  type: 'containerDirective' | 'leafDirective' | 'textDirective'
  name: string
  attributes?: Record<string, unknown>
  data?: Record<string, unknown>
}

const CALLOUT_TYPES = ['note', 'info', 'warning', 'error', 'success', 'tip'] as const

function isDirectiveNode(node: unknown): node is DirectiveNode {
  if (!node || typeof node !== 'object') return false

  const type = (node as { type?: unknown }).type
  return type === 'containerDirective' || type === 'leafDirective' || type === 'textDirective'
}

function isCalloutType(name: string) {
  return CALLOUT_TYPES.includes(name as (typeof CALLOUT_TYPES)[number])
}

// 将 directive 转换为 JSX 组件
export function remarkCallout() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (!isDirectiveNode(node) || !isCalloutType(node.name)) return

      const data = node.data || (node.data = {})
      const attributes = node.attributes || {}

      data.hName = 'Callout'
      data.hProperties = {
        type: node.name === 'tip' ? 'info' : node.name,
        title: typeof attributes.title === 'string' ? attributes.title : undefined,
      }
    })
  }
}
