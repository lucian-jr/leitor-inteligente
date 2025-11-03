import axios from 'axios'
import { api } from '../api'
import type { getLastInsertedIdType, getLastInsertedRowType } from './reads.types'

export const getLastInsertedId = async () => {
    try {
        const response = await api.get(`get_last_inserted_id?v=${Date.now()}`);
        
        const data: getLastInsertedIdType = response.data;

        return data;

    } catch (error) {
        console.log('reads.service/getLastInsertedId error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao buscar o ultimo id';

        return {
            'status': 'error',
            'message': message,
            'last_id_data': null
        };
    }
}

export const getLastInsertedData = async (last_id : number) => {
    try {
        const response = await api.get(`get_last_inserted_data/${last_id}?v=${Date.now()}`);
        
        const data: getLastInsertedRowType = response.data;

        return data;

    } catch (error) {
        console.log('reads.service/getInsertedData error: ', error)

        const message = (axios.isAxiosError(error) && error?.response?.data?.message) || 'Houve um problema ao buscar o ultimo id';

        return {
            'status': 'error',
            'message': message,
            'last_inserted_data': null
        };
    }
}