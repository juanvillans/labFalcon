import { DataGrid, GridActionsCellItem, getGridStringOperators } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import React, { useMemo } from "react";
import { usersAPI } from "../../services/api";
import { Icon } from "@iconify/react";
import FuturisticButton from "../../components/FuturisticButton";

// Función reutilizable para crear operadores de filtro para columnas de texto
const getStringFilterOperators = () => [
  {
    value: 'contains',
    getApplyFilterFn: () => () => true, // La lógica real se maneja en el servidor
    InputComponent: getGridStringOperators().find(op => op.value === 'contains').InputComponent
  },
  {
    value: 'equals',
    getApplyFilterFn: () => () => true,
    InputComponent: getGridStringOperators().find(op => op.value === 'equals').InputComponent
  },
  {
    value: 'startsWith',
    getApplyFilterFn: () => () => true,
    InputComponent: getGridStringOperators().find(op => op.value === 'startsWith').InputComponent
  },
  {
    value: 'endsWith',
    getApplyFilterFn: () => () => true,
    InputComponent: getGridStringOperators().find(op => op.value === 'endsWith').InputComponent
  },
  {
    value: 'doesNotContain',
    getApplyFilterFn: () => () => true,
    InputComponent: getGridStringOperators().find(op => op.value === 'doesNotContain').InputComponent
  }
];



const columns = [
  { field: "id", headerName: "ID", width: 60 },
  {
    field: "name",
    headerName: "Nombre",
    width: 150,
    type: "string",
    filterOperators: getStringFilterOperators()
  },
  {
    field: "last_name",
    headerName: "Apellido",
    width: 150,
    type: "string",
    filterOperators: getStringFilterOperators()
  },
  {
    field: "email",
    headerName: "Correo Electrónico",
    width: 200,
    type: "string",
    filterOperators: getStringFilterOperators()
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

  {
    field: "actions",
    headerName: "",
    type: "actions",
    flex: 1,
    filterable: false,
    getActions: (params) => [
      <GridActionsCellItem
        key="delete"
        icon={<Icon icon="hugeicons:delete-02" width={20} height={20} />}
        label="Delete"
        onClick={() => console.log("Delete", params.id)}
      />,
      <GridActionsCellItem
        key="edit"
        icon={<Icon icon="hugeicons:edit-02" width={20} height={20} />}
        label="Edit"
        onClick={() => console.log("Edit", params.id)}
      />,
      // Add more action items as needed
    ],
  },
];

export default function Page() {
  const dataSource = useMemo(
    () => ({
      getRows: async (params) => {
        try {
          console.log({
            page: params.paginationModel.page,
            pageSize: params.paginationModel.pageSize,
            filters: JSON.stringify(params.filterModel.items[0]), // Spread filter fields
            // Spread filter fields
            sort: params.sortModel.map((s) => `${s.field}:${s.sort}`).join(","),
          })
          // Call your actual API endpoint with Axios
          const response = await usersAPI.getUsers({
            page: params.paginationModel.page,
            pageSize: params.paginationModel.pageSize,
            filters: JSON.stringify(params.filterModel.items[0]), // Spread filter fields
            sort: params.sortModel.map((s) => `${s.field}:${s.sort}`).join(","),
          });

          return {
            rows: response.data.users, // Your API response format may vary
            rowCount: response.data.totalCount, // Total number of records for pagination
          };
        } catch (error) {
          console.error("Error fetching data:", error);
          return { rows: [], rowCount: 0 };
        }
      },
    }),
    [] // Empty dependency array since we're not using any external deps
  );
  return (
    <div style={{ height: 580, width: "100%" }}>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <FuturisticButton>
          <Link to="/dashboard/usuarios/crear">Crear usuario</Link>
        </FuturisticButton>
      </div>

      <DataGrid
        columns={columns}
        dataSource={dataSource}
        pagination
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25, page: 1 },
            rowCount: 0,
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
}
