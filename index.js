import jsxSyntax from '@babel/plugin-syntax-jsx'

export default function (babel) {
  const {
    types: t,
    template,
  } = babel

  const execUseId = template('const %%id%% = React.useId();')
  const idExpression = template.expression('`${%%id%%}`')
  const urlIdExpression = template.expression('`url(#${%%id%%})`')
  const hashExpression = template.expression('`#${%%id%%}`')

  const idChar = '(?<id>\w[:.-]*)'
  const urlRex = new RegExp(`^url\\(#${idChar}\\)$`)
  const hashRex = new RegExp(`^#${idChar}$`)

  const attributeVisitor = {
    JSXAttribute(path) {
      const value = path.get('value.value').node
      if (!value)
        return
      // 获取 id
      if (path.get('name').isJSXIdentifier({
        name: 'id',
      })) {
        this.ids.set(value, path)
      }
      const urlResult = value.match(urlRex)
      const hashResult = value.match(hashRex)
      if (!urlResult && !hashResult)
        return
      // 获取 values
      const { id, expression } = urlResult
        ? {
            id: urlResult.groups.id,
            expression: urlIdExpression,
          }
        : { id: hashResult.groups.id, expression: hashExpression }
      const paths = this.values.get(id)
      const item = { path, expression }
      this.values.set(id, paths ? [...paths, item] : [item])
    },
  }

  return {
    name: 'ast-transform',
    // not required
    inherits: jsxSyntax,
    visitor: {
      Function(path) {
        const ids = new Map()
        const values = new Map()

        path.traverse(attributeVisitor, { ids, values })

        if (!ids.size)
          return

        if (path.isArrowFunctionExpression()) {
          path.arrowFunctionToExpression()
        }

        const blockStatement = path.get('body')
        if (!blockStatement.isBlockStatement())
          return

        const idIdentifierMap = new Map()
        ids.forEach((path, id) => {
          const idIdentifier = path.scope.generateUidIdentifier('id')
          idIdentifierMap.set(id, idIdentifier)
          // 生成 const id = React.useId();
          const uniqueIdDeclaration = execUseId({
            id: idIdentifier,
          })
          // 将这一行放到 body 中去
          blockStatement.unshiftContainer('body', uniqueIdDeclaration)
          // 生成 {`${id}`}
          path.get('value').replaceWith(t.jsxExpressionContainer(idExpression({
            id: idIdentifier,
          })))
        })

        values.forEach((paths, id) => {
          const idIdentifier = idIdentifierMap.get(id)
          if (!idIdentifier)
            return
          paths.forEach(({ path, expression }) => {
            path.get('value').replaceWith(t.jsxExpressionContainer(expression({
              id: idIdentifier,
            })))
          })
        })
      },
    },
  }
};
