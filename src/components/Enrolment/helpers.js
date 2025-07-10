/**
 * Created by fulle on 2025/07/10.
 */
import MFLApiService from '../../services/mfl.service';
import UserService from '../../services/user.service';

export const lookupFacilities = async (query) => {
    try {
        const data = await MFLApiService.searchFacilities(query);
        window.console.log("lookup result");
        window.console.log(data);
        if(data && data.length > 0 && data[0].newFacilityCode)
            return data;
        else
            return [];
    } catch (err) {
        console.error('Facilities fetch error:', err);
        throw ('Failed to load facilities. Please try again later.');
    } finally {

    }
};

export const listAllUsers = async () => {
    try {
        const data = await UserService.listAll();
        window.console.log("lookup result");
        window.console.log(data);
        /*if(data && data.length > 0 && data[0].newFacilityCode)
            return data;
        else
            return [];*/
        return data;
    } catch (err) {
        console.error('Facilities fetch error:', err);
        throw ('Failed to load facilities. Please try again later.');
    } finally {

    }
};

