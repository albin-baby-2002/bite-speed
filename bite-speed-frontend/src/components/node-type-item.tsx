import { useRef } from 'react';
import type { TNodeType } from '../App';
import { useDrag } from 'react-dnd';

//------------------------------------------------------------------

const NodeTypeItem = ({ node }: { node: TNodeType }) => {
  // useRef to have reference to html div

  const ref = useRef<HTMLDivElement>(null);

  // useDrag hook to define the node type that we want to drag and drop
  // also to handle state like is-dragging etc

  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'NODE-TYPE',
    item: { ...node }, // date of the node
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  dragRef(ref);

  //------------------------------------------------------------------

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? '80%' : '100%' }}
      className="flex-col capitalize w-full h-20 cursor-grab gap-2 flex items-center justify-center border-2 rounded-sm border-black/40 font-bold text-black/70 "
    >
      {node.icon}
      {node.type}
    </div>
  );
};

export default NodeTypeItem;
