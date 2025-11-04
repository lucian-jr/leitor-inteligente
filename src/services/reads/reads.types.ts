export type lastInsertedIdDataType = {
    id: number | 0
    antena: number | 0
}

export type lastIdDataType = {
    id: number
    antena: number
    rf_id: string
}

export type getLastInsertedIdType = {
    status: string
    message: string
    last_id_data: lastInsertedIdDataType
};

export type getLastInsertedRowType = {
    status: string
    message: string
    last_inserted_data: lastIdDataType
};