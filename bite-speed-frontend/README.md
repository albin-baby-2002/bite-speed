Simple chat flow application
1. drag and drop message nodes from right panel to start using
2. connect source and target handle of two nodes to create a flow

How to add new node types
1.add the new type of node you wanted to add in
 type TTypeOfNodes in app.tsx
2.add the audio component in the node components
3.also update the NODES constant in app.tsx to include new type and its icon and label
4.now you are ready to connect new type of nodes