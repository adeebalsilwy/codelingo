import { Datagrid, List, TextField, ReferenceField, Pagination, TopToolbar, CreateButton, ExportButton } from "react-admin";
import RefreshButton from "../utils/RefreshButton";

// Custom pagination component with selectable page sizes
const CustomPagination = () => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />;

// Custom actions toolbar with refresh button
const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
    <RefreshButton resource="units" />
  </TopToolbar>
);

export const UnitList = () => {
  return (
    <List
      pagination={false}
      perPage={-1}
      sort={{ field: "id", order: "DESC" }}
      actions={<ListActions />}
      disableAuthentication
      storeKey={`units-${Date.now()}`}
      queryOptions={{
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        retry: 1
      }}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="title" />
        <TextField source="description" />
        <ReferenceField source="courseId" reference="courses" />
        <TextField source="order" />
      </Datagrid>
    </List>
  );
};
