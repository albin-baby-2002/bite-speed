import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  useReactFlow,
  type EdgeChange,
  type NodeChange,
  type Connection,
  type NodeProps,
} from "@xyflow/react";

import {
  useState,
  useCallback,
  type JSX,
  useRef,
  useMemo,
  useEffect,
} from "react";

import { toast } from "sonner";
import "@xyflow/react/dist/style.css";
import { useDrop } from "react-dnd";
import NodeTypeItem from "./components/node-type-item";
import TextMessageNode from "./components/text-message-node";
import { ArrowLeft, MessageSquareText } from "lucide-react";

//---------------------------------------------------------------

// types

export type TTypeOfNodes = "text";

export interface TNodeType {
  type: TTypeOfNodes;
  icon: JSX.Element;
  label: string;
}

interface TEdgeData {
  id: string;
  source: string;
  target: string;
}

interface TNodeData {
  id: string;
  position: { x: number; y: number };
  data: { message: string };
  type: TTypeOfNodes;
}

//---------------------------------------------------------------

// constants

const NODE_DATA_KEY = "CHAT_FLOW_NODES";
const EDGE_DATA_KEY = "CHAT_FLOW_EDGES";

const NODES: TNodeType[] = [
  {
    type: "text",
    icon: <MessageSquareText />,
    label: "Message",
  },
];

const nodeComponents: Record<TTypeOfNodes, (props: NodeProps) => JSX.Element> =
  {
    text: TextMessageNode,
  };

//---------------------------------------------------------------

// main component

function App() {
  // state

  const [nodes, setNodes] = useState<TNodeData[]>([]);
  const [edges, setEdges] = useState<TEdgeData[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<TNodeData[]>([]);

  const ref = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // memo

  const targets = useMemo(() => {
    return Array.from(new Set(edges.map((item) => item.target)));
  }, [edges]);

  // useEffect to get data from localstorge intially to set to state

  useEffect(() => {
    const nodes = JSON.parse(localStorage.getItem(NODE_DATA_KEY) || "[]");
    const edges = JSON.parse(localStorage.getItem(EDGE_DATA_KEY) || "[]");
    setNodes(nodes as TNodeData[]);
    setEdges(edges as TEdgeData[]);
  }, []);

  // hook to handle the drop of the NODE-TYPE item

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "NODE-TYPE",
    drop: (item: TNodeType, monitor) => {
      const offset = monitor.getClientOffset();
      const bounds = ref.current?.getBoundingClientRect();

      if (!offset || !bounds) return;

      // react-flow method to convert the screen coordinate of drop to
      // relative coordinate of the flow area

      const position = screenToFlowPosition({
        x: offset.x - bounds.left,
        y: offset.y - bounds.top,
      });

      // add new node to prev nodes and give id by length+1;
      // can be improved - if node in between is deleted this will fail to create unique id

      setNodes((prev) => [
        ...prev,
        {
          id: `n${prev.length + 1}`,
          position,
          type: item.type,
          data: { message: "New Node" },
        },
      ]);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // functions

  // setting updated nodes after using applyNodeChanges method of react-flow
  const onNodesChange = useCallback(
    (changes: NodeChange<TNodeData>[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  // setting updated edges after using applyEdgeChanges method of react-flow
  const onEdgesChange = useCallback((changes: EdgeChange<TEdgeData>[]) => {
    setEdges((edgesSnapshot) => {
      return applyEdgeChanges(changes, edgesSnapshot);
    });
  }, []);

  //  handling node connections - preventing a new connection if source already have connection
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => {
        const alreadyHasEdge = edgesSnapshot.some(
          (e) => e.source === params.source,
        );

        if (alreadyHasEdge) {
          toast.error("One source can connect to one node only");
          return edgesSnapshot;
        }
        return addEdge(params, edgesSnapshot);
      }),
    [],
  );

  // method to save the changes to node text from edit message panel
  const handleNodeUpdate = (text: string, id: string) => {
    setNodes((item) => {
      return item.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, message: text } }
          : node,
      );
    });
  };

  // method to unselect all node by setting selected false
  const unselectAll = () => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
  };

  // go back function - edit message panel is open when there is some selected node
  const handleGoBack = () => unselectAll();

  // function to save changes - giving toast error if more than 1 node have empty target
  // also on successfull validation saving data in local storage
  const handleSave = () => {
    const error = nodes.length > 1 && nodes.length - targets.length > 1;

    if (error) {
      return toast.error("Cannot save flow", {
        description: "More than one node cannot have empty targets",
      });
    }
    localStorage.setItem(NODE_DATA_KEY, JSON.stringify(nodes));
    localStorage.setItem(EDGE_DATA_KEY, JSON.stringify(edges));
    toast.success("Successfully saved");
  };

  // to mention the drop ref;
  dropRef(ref);

  //----------------------------------------------------------------------

  return (
    <div className="grid h-screen max-h-screen w-screen grid-cols-[1fr_350px_10px] overflow-hidden">
      {/* the chat bot flow  */}
      <div
        ref={ref}
        style={{
          background: isOver ? "azure" : "",
        }}
        className="relative"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeComponents}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={(params) => {
            setSelectedNodes(params.nodes);
          }}
          defaultViewport={{ x: 0, y: 0, zoom: 1.3 }}
        >
          <Background />
          <Controls />
        </ReactFlow>

        {/* added simple info for user to how to start with */}

        {nodes.length === 0 && (
          <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            Drag and drop a node from right panel to start building chat flow
          </p>
        )}
      </div>

      {/* panel */}

      <div className="grid h-full w-full grid-rows-[1fr_65px] overflow-hidden border-r border-l border-black/40 bg-white">
        <div className="grid h-full grid-rows-[45px_1fr] overflow-hidden">
          <HeaderItem
            selectedNodes={selectedNodes}
            handleGoBack={handleGoBack}
          />

          {/* react flow allow selecting multiple nodes at a time so giving option to edit mulitple nodes at a time */}

          {selectedNodes.length > 0 ? (
            <div className="flex max-h-full flex-col gap-4 overflow-y-auto p-4">
              {selectedNodes.map((item, idx) => (
                <NodeEditItem
                  key={item.id + idx}
                  item={item}
                  handleNodeUpdate={handleNodeUpdate}
                />
              ))}
            </div>
          ) : (
            <NodesPanel />
          )}
        </div>

        {/* save button */}

        <div className="flex items-center justify-center border-t border-black/40 px-4">
          <button
            onClick={handleSave}
            className="h-10 w-full cursor-pointer rounded-sm bg-black/80 font-bold text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

// child components

const HeaderItem = ({
  selectedNodes,
  handleGoBack,
}: {
  selectedNodes: TNodeData[];
  handleGoBack: () => void;
}) => {
  return (
    <div className="border-b border-black/40 p-2 text-center text-lg font-bold text-black/80">
      {selectedNodes.length > 0 ? (
        <div className="flex items-center">
          <ArrowLeft
            onClick={handleGoBack}
            className="cursor-pointer"
            size={18}
          />
          <p className="mr-4 flex-1">Message</p>
        </div>
      ) : (
        <p>Chat Panel</p>
      )}
    </div>
  );
};

const NodesPanel = () => {
  return (
    <div className="grid max-h-full grid-cols-2 gap-2 overflow-y-auto p-4">
      {/* looping through available types of nodes */}

      {NODES.map((item, idx) => (
        <NodeTypeItem key={item.type + idx} node={item} />
      ))}
    </div>
  );
};

const NodeEditItem = ({
  item,
  handleNodeUpdate,
}: {
  item: TNodeData;
  handleNodeUpdate: (text: string, id: string) => void;
}) => {
  return (
    <div key={item.id} className="flex flex-col gap-2 font-medium capitalize">
      <p>{item.type}</p>
      <textarea
        onChange={(e) => {
          handleNodeUpdate(e.target.value, item.id);
        }}
        defaultValue={item.data.message}
        className="rouded-sm w-full border border-black/60 p-2"
      />
    </div>
  );
};
