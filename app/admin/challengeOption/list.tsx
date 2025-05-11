import { Datagrid, List, TextField, ReferenceField, NumberField, BooleanField, TopToolbar, CreateButton, ExportButton } from "react-admin";
import RefreshButton from "../utils/RefreshButton";

// Custom actions toolbar with refresh button
const ListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
    <RefreshButton resource="challengeOptions" />
  </TopToolbar>
);

export const ChallengeOptionList = () => {
  return (
    <List
      pagination={false}
      perPage={25}
      sort={{ field: "id", order: "DESC" }}
      actions={<ListActions />}
      disableAuthentication
      storeKey={`challengeOptions-${Date.now()}`}
      queryOptions={{
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        gcTime: 0,
        retry: 1
      }}
    >
      <Datagrid rowClick="edit">
        <NumberField source="id" />
        <TextField source="text" />
        <BooleanField source="correct" />
        <ReferenceField source="challengeId" reference="challenges" />
        <TextField source="imageSrc" />
        <TextField source="audioSrc" />
      </Datagrid>
    </List>
  );
};

