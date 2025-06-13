import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import axios from "axios";
import React, { useMemo } from "react";
import { authAPI, usersAPI } from "../../services/api";
import { Icon } from "@iconify/react";
import FuturisticButton from "../../components/FuturisticButton";

const columns = [
  { field: "id", headerName: "ID", width: 60 },
  // {
  //   field: "role",
  //   headerName: "Rol ó Cargo",
  //   width: 150,
  //   filterable: false,
  // },
  {
    field: "name",
    headerName: "Nombre",
    width: 150,
  },
  {
    field: "last_name",
    headerName: "Apellido",
    width: 150,
  },
  {
    field: "email",
    headerName: "Correo Electrónico",
    width: 200,
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
          // Call your actual API endpoint with Axios
          const response = await usersAPI.getUsers({
            page: params.paginationModel.page,
            pageSize: params.paginationModel.pageSize,
            ...params.filterModel, // Spread filter fields
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
            paginationModel: { pageSize: 25, page: 0 },
            rowCount: 0,
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />
    </div>
  );
}
