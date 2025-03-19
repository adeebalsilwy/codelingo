import {
    List,
    Datagrid,
    TextField,
    EditButton,
    DeleteButton,
    ReferenceField,
    NumberField,
    FilterForm,
    TextInput,
    ReferenceInput,
    SelectInput,
} from "react-admin";

interface ChapterRecord {
  id: number;
    title: string;
    description: string;
  content: string;
  video_youtube: string;
    unitId: number;
    order: number;
}

interface ChapterListProps {
    unitId?: number;
}

const ChapterFilters = [
    <TextInput key="title" source="title" label="Search by Title" alwaysOn />,
    <ReferenceInput key="unitId" source="unitId" reference="units" label="Filter by Unit" alwaysOn>
        <SelectInput
            optionText={(record) => {
                if (!record) return "";
                const unit = record as { title: string; course: { title: string } };
                return unit.course ? `${unit.title} - ${unit.course.title}` : unit.title;
            }}
        />
    </ReferenceInput>,
];

export const ChapterList = ({ unitId }: ChapterListProps) => {
    const filterDefaultValues = unitId ? { unitId } : undefined;
    const filter = unitId ? { unitId } : undefined;

    return (
        <List 
            filters={ChapterFilters} 
            filterDefaultValues={filterDefaultValues}
            filter={filter}
        >
            <Datagrid>
                <TextField source="id" />
                <TextField source="title" />
                <ReferenceField
                    source="unitId"
                    reference="units"
                    label="Unit"
                    link={false}
                >
                    <TextField
                        source="title"
                        render={(record: any) => {
                            if (!record) return "";
                            const unit = record as { title: string; course: { title: string } };
                            return unit.course ? `${unit.title} - ${unit.course.title}` : unit.title;
                        }}
                    />
                </ReferenceField>
                <NumberField source="order" />
                <TextField
                    source="description"
                    sortable={false}
                    cellClassName="truncate max-w-xs"
                />
                <TextField
                    source="video_youtube"
                    label="Has Video"
                    sortable={false}
                    render={(record: ChapterRecord) => record.video_youtube ? "Yes" : "No"}
                />
                <EditButton />
                <DeleteButton />
            </Datagrid>
        </List>
    );
};

export default ChapterList;