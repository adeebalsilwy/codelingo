import { Datagrid, List, TextField, ReferenceField, NumberField, SelectField, TopToolbar, CreateButton, ExportButton } from "react-admin";
import RefreshButton from "../utils/RefreshButton";

// Custom actions toolbar with refresh button
const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
    <RefreshButton resource="challenges" />
  </TopToolbar>
);

export const ChallengeList = () => {
  return (
    <List
      pagination={false}
      perPage={-1}
      sort={{ field: "id", order: "DESC" }}
      actions={<ListActions />}
      disableAuthentication
      storeKey={`challenges-${Date.now()}`}
      queryOptions={{
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        cacheTime: 0,
        retry: 1
      }}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="question" />
        <SelectField
          source="type"
          choices={[
            {
              id: "SELECT",
              name: "SELECT",
            },
            {
              id: "ASSIST",
              name: "ASSIST",
            }
          ]}
        />
        <ReferenceField source="lessonId" reference="lessons" />
        <NumberField source="order" />
      </Datagrid>
    </List>
  );
};
