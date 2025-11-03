export type lastIdDataType = {
    id: number
    antena: number
}

export type getLastInsertedIdType = {
    status: string
    message: string
    last_id_data: lastIdDataType
};

export type getLastInsertedRowType = {
    status: string
    message: string
    last_inserted_data: lastIdDataType
};