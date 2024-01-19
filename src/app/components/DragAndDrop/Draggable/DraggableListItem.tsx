import React, { ReactNode } from "react";
import { useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from "react-dnd";

interface DraggableListItemProps {
	id: number;
	index: number;
	moveListItem: (dragIndex: number, hoverIndex: number) => void;
	children: ReactNode;
	type: string;
}

export default function DraggableListItem({
	id,
	index,
	moveListItem,
	children,
	type,
}: DraggableListItemProps) {
	const [{ isDragging }, drag] = useDrag({
		type: type,
		item: { id, index },
		collect: (monitor: DragSourceMonitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
	});

	const [drop, setDrop] = useDrop({
		accept: type,
		drop: (item: { id: number; index: number }, monitor: DropTargetMonitor) => {
			if (item.id === id) {
				return;
			}
			const dragIndex = item.index;
			const hoverIndex = index;

			// Don't replace items with themselves
			if (dragIndex === hoverIndex) {
				return;
			}

			// Move the content
			moveListItem(dragIndex, hoverIndex);
			// Note: we're mutating the monitor item here!
			item.index = hoverIndex;
		},
	});

	return (
		<div ref={(node) => drag(setDrop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
			{children}
		</div>
	);
}
