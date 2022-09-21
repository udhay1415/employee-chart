import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import ReactFlow, { applyNodeChanges, applyEdgeChanges, addEdge } from 'react-flow-renderer';
import "./flow.scss";

const baseURL = "http://localhost:8000/api/v1"

const Flow = () => {

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    getEmployeeList()
    getManagerList()
  }, [])

  const getEmployeeList = () => {
    axios.get(`${baseURL}/employees/`, {

    })
    .then(res => {
      if (res.status === 200 && res.data.results && res.data.results.length > 0) {
        let employeeNodes = []
        res.data.results.forEach(employee => {
          const employeeNode = [{
            id: employee.emp_id.toString(),
            data: { label: employee.name },
            position: { x: employee.x_coord, y: employee.y_coord },
          }]
          console.log(employeeNode)
          employeeNodes = employeeNodes.concat(employeeNode)
        })
        setNodes(employeeNodes)
      }
    }).catch(err => {
      console.log(err)
    })
  }

  const getManagerList = () => {
    axios.get(`${baseURL}/managers/`, {

    })
    .then(res => {
      if (res.status === 200 && res.data.results && res.data.results.length > 0) {
        let employeeManagers = []
        res.data.results.forEach(employee => {
          const employeeManager = [{
            id: employee.id,
            source: employee.manager_.toString(),
            target: employee.employee_.toString()
          }]
          employeeManagers = employeeManagers.concat(employeeManager)
        })
        setEdges(employeeManagers)
      }
    }).catch(err => {
      console.log(err)
    })
  }

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => {
      console.log('changes', changes, 'nds', nds)
      return applyNodeChanges(changes, nds)
    }),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => {
      console.log('changes', changes, 'eds', eds)
      return applyEdgeChanges(changes, eds)
    }),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => {
      const source = connection.source
      const target = connection.target
      axios.post(
        `${baseURL}/employees/${Number(target)}/`,
        {"manager_id": Number(source)}
      ).then(res => {
        console.log("res update", res)
      }).catch(err => {
        console.log(err)
      })
      let initialEdgesClone = [...edges]
      initialEdgesClone.forEach((e, index) => {
        if(target == e.target) {
          const obj = [{ id: e.id, source: source, target: target }]
          console.log("obj--", index, obj, initialEdgesClone)
          initialEdgesClone.splice(index, 1)
          initialEdgesClone = initialEdgesClone.concat(obj)
        }
      })
      setEdges(initialEdgesClone)
      return addEdge(connection, initialEdgesClone)
    }),
    [setEdges, edges]
  );

  const onNodeDragStop = (event, node) => {
    const emp_id = node.id
    const x_coord = Math.round(node.position.x)
    const y_coord = Math.round(node.position.y)
    axios.post(
      `${baseURL}/employees/${Number(emp_id)}/coords/`,
      {"x_coord": x_coord, "y_coord": y_coord}
    ).then(res => {
      console.log("res", res)
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <div className="flow">
      {
        nodes.length > 0 && edges.length > 0 ? (
          <ReactFlow 
            onNodesChange={onNodesChange} 
            onEdgesChange={onEdgesChange} 
            onConnect={onConnect} 
            nodes={nodes} 
            edges={edges}
            fitView
            onNodeDragStop={onNodeDragStop}
          />
        ): <div className="flow__loading">Loading...</div>
      }
    </div>
  )
}

export default Flow;