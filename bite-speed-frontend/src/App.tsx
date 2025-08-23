import { MessageSquareText } from "lucide-react";
import { useState, useCallback, type JSX, useRef } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import NodeTypeItem from "./components/node-type-item";
import { useDrop } from "react-dnd";

//---------------------------------------------------------------

// types

export interface TNodeType {
  type: string;
  icon: JSX.Element;
}

//---------------------------------------------------------------

// constants

const initialNodes = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
];

const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

const NODES: TNodeType[] = [
  {
    type: "message",
    icon: <MessageSquareText />,
  },
];

//---------------------------------------------------------------

// main component

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const ref = useRef<HTMLDivElement>(null);

  const { screenToFlowPosition } = useReactFlow();

  // hook to handle the drop of the node type item

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "NODE-TYPE",
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
          data: { label: "New Node" },
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
    [],
  );
  const onEdgesChange = useCallback(
    (changes) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );
  dropRef(ref);

  return (
    <div className="grid h-screen max-h-screen w-screen grid-cols-[1fr_350px_10px] overflow-hidden">
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
      <div className="grid h-full w-full grid-rows-[1fr_65px] overflow-hidden border-r border-l border-black/40 bg-white">
        <div className="grid h-full grid-rows-[45px_1fr] overflow-hidden">
          <div className="border-b border-black/40 p-2 text-center text-lg font-bold text-black/80">
            <p>Chat-Bot Flow Panel</p>
          </div>
          <div className="grid max-h-full grid-cols-2 gap-2 overflow-y-auto p-4">
            {/* looping through available types of nodes */}

            {NODES.map((item, idx) => (
              <NodeTypeItem key={item.type + idx} node={item} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center border-t border-black/40 px-4">
          <button className="h-10 w-full cursor-pointer rounded-sm bg-black/80 font-bold text-white">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
