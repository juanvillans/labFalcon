import React, { useState, useEffect, useCallback } from "react";
// Eliminar estas importaciones de CSS
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
import { Link } from "react-router-dom";
import { authAPI, usersAPI } from "../../services/api";
import { Icon } from "@iconify/react";
import FuturisticButton from "../../components/FuturisticButton";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

ModuleRegistry.registerModules([AllCommunityModule]);
// En las versiones más recientes, no necesitas registrar módulos para funcionalidades básicas
// La versión Community ya incluye el ClientSideRowModel por defecto

// Función reutilizable para crear operadores de filtro para columnas de texto

const columns = [
  { field: "id", headerName: "ID", width: 60 },
  {
    field: "name",
    headerName: "Nombre",
    width: 150,
    type: "string",
  },
  {
    field: "last_name",
    headerName: "Apellido",
    width: 150,
    type: "string",
  },
  {
    field: "email",
    headerName: "Correo Electrónico",
    width: 200,
    type: "string",
  },
  {
    field: "allow_validate_exam",
    headerName: "Puede Validar",
    type: "boolean",
    width: 130,
  },
  {
    field: "allow_handle_users",
    headerName: "Gestión de Usuarios",
    type: "boolean",
    width: 180,
  },

  // {
  //   field: "actions",
  //   headerName: "",
  //   type: "actions",
  //   flex: 1,
  //   filterable: false,
  //   getActions: (params) => [
  //     <GridActionsCellItem
  //       key="delete"
  //       icon={<Icon icon="hugeicons:delete-02" width={20} height={20} />}
  //       label="Delete"
  //       onClick={() => console.log("Delete", params.id)}
  //     />,
  //     <GridActionsCellItem
  //       key="edit"
  //       icon={<Icon icon="hugeicons:edit-02" width={20} height={20} />}
  //       label="Edit"
  //       onClick={() => console.log("Edit", params.id)}
  //     />,
  //     // Add more action items as needed
  //   ],
  // },
];

export default function Page() {

  const [colDefs, setColDefs] = useState([
    { field: "id", headerName: "ID", width: 60 },
    {
      field: "name",
      headerName: "Nombre",
      width: 150,
      type: "string",
    },
    {
      field: "last_name",
      headerName: "Apellido",
      width: 150,
      type: "string",
    },
    {
      field: "email",
      headerName: "Correo Electrónico",
      width: 200,
      type: "string",
    },
    {
      field: "allow_validate_exam",
      headerName: "Puede Validar",
      type: "boolean",
      width: 130,
    },
    {
      field: "allow_handle_users",
      headerName: "Gestión de Usuarios",
      type: "boolean",
      width: 180,
    },
  ]);
  const [rowData, setRowData] = useState([]);
  const [pageSize] = useState(10);
  const [rowCount, setRowCount] = useState(null);
  const [gridApi, setGridApi] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await usersAPI.getAllUsers();
      console.log(res.data);
      setRowData(res.data.users);
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  
  return (
    <div style={{ height: 580, width: "100%" }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <FuturisticButton>
          <Link to="/dashboard/usuarios/crear">Crear usuario</Link>
        </FuturisticButton>
      </div>

      <div className="ag-theme-alpine" style={{ height: 600 }}>
        <AgGridReact
          columnDefs={columns}
          rowData={rowData}
          
        />
      </div>
    </div>
  );
}
