import { useMemo, useState } from 'react'

import { useLife, type NodeData } from '../../store/life'

import './node.styles.scss'

interface LifeNodeProps {
	lifeformId: string
}

const LifeNode = (props: LifeNodeProps) => {
	const lifeNodes = useLife((state) => state.lifeNodes)
	const activeNode = useMemo(() => lifeNodes[props.lifeformId] ?? null, [props.lifeformId, lifeNodes])
	const rootNode = useLife((state) => state.rootNode) ?? Object.values(lifeNodes).find((node) => !node.parent) ?? null
	const isRootNode = !!rootNode && activeNode?.id === rootNode?.id
	const hasParent = !!activeNode?.parent || !isRootNode
	const hasChildren = activeNode?.children.length > 0
	const showChildren = activeNode?.showChildren ?? false

	return <div className={['node-component', !activeNode ? 'missing' : [
		hasParent ? 'has-parent' : 'no-parent',
		hasChildren ? 'has-children' : 'no-children',
		showChildren ? 'showing-children' : 'hiding-children',
	]].filter(Boolean).join(' ')} data-lifeform-id={activeNode?.id}></div>
}

export default LifeNode
