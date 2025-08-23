import { MessageSquareText } from 'lucide-react';
import { useState, useCallback, type JSX, useRef } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import NodeTypeItem from './components/node-type-item';
import { useDrop } from 'react-dnd';

//---------------------------------------------------------------

// types

export interface TNodeType {
  type: string;
  icon: JSX.Element;
}

//---------------------------------------------------------------

// constants

const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];

const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

const NODES: TNodeType[] = [
  {
    type: 'message',
    icon: <MessageSquareText />,
  },
];

//---------------------------------------------------------------

// main component

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const ref = useRef<HTMLDivElement>(null);

  const {screenToFlowPosition} = useReactFlow()

  // hook to handle the drop of the node type item

const [{ isOver }, dropRef] = useDrop(() => ({
  accept: 'NODE-TYPE',
  drop: (item, monitor) => {
    const offset = monitor.getClientOffset();
    const bounds = ref.current?.getBoundingClientRect();

    if (!offset || !bounds) return;

    // translate from client coords → relative to flow div
    const position = screenToFlowPosition({
      x: offset.x - bounds.left,
      y: offset.y - bounds.top,
    });

    setNodes((prev) => [
      ...prev,
      {
        id: `n${prev.length + 1}`,
        position,
        data: { label: 'New Node' },
      },
    ]);
  },
  collect: (monitor) => ({
    isOver: !!monitor.isOver(),
  }),
}));

  const onNodesChange = useCallback(
    (changes) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );
  dropRef(ref);

  return (
    <div className=" grid grid-cols-[1fr_350px] h-screen max-h-screen overflow-hidden w-screen">
      {/* the chat bot flow  */}
      <div ref={ref}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      {/* panel */}
      <div className=" bg-gray-200 h-full w-full overflow-hidden grid grid-rows-[1fr_55px]">
        <div className=" h-full  overflow-hidden grid grid-rows-[45px_1fr]">
          <div className=" p-2 text-lg font-bold text-center text-black/80  border-b border-black/40 ">
            <p>Chat-Bot Flow Panel</p>
          </div>
          <div className=" grid gap-2 grid-cols-2 p-4 max-h-full overflow-y-auto">
            {/* looping through available types of nodes */}

            {NODES.map((item, idx) => (
              <NodeTypeItem key={item.type + idx} node={item} />
            ))}
          </div>
        </div>
        <button className=" bg-black/80 rounded-sm text-white h-10 m-2 font-bold cursor-pointer">
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default App;
