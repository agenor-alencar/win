import { api } from '../lib/Api';



export const userList = async () => {
    try {
        const response = await api.get('/list/id/' + localStorage.getItem("win-user.id"));
        return response.data;
    }
    catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};
