"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableContainer from "@/components/event-dashboard/TableContainer";

type ObjType = { [key: string]: string | number | boolean };
export interface TableViewProps {
  id: string;
  name: string;
  tableData: ObjType[];
}

export type CardNeedsStatus = {
  card_type_id: string;
  name: string;
  is_active: boolean;
}[];

export default function TableView({
  cardWithTableData,
  eventId,
  cardNeedsStatus,
  statusCols
}: {
  cardWithTableData: TableViewProps[];
  eventId: string;
  cardNeedsStatus: CardNeedsStatus;
  statusCols: string[]
}) {
  const [defaultState, setDefaultState] = useState(cardWithTableData[0].name);
  return (
    <div className='flex w-full flex-col gap-6'>
      <Tabs defaultValue={defaultState}>
        <TabsList className='w-full md:w-7/8 mx-auto'>
          {cardWithTableData.map((cd) => (
            <TabsTrigger
              key={cd.id}
              value={cd.name}
              onClick={() => {
                setDefaultState(cd.name);
              }}
            >
              {cd.name.charAt(0).toUpperCase() + cd.name.slice(1).toLowerCase()}
            </TabsTrigger>
          ))}
        </TabsList>
        {cardWithTableData.map((cd) => (
          <TabsContent key={cd.id as string} value={cd.name as string}>
            {/* Table component goes here */}
            <TableContainer
              tableData={cd.tableData!}
              cardType={cd.id}
              eventId={eventId}
              cardNeeds={cardNeedsStatus}
              statusCols={statusCols}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
