import {ActionOperator, Dictionary, Primitive} from '../common/types';
import U from '../common/u';

class Action {
    static SET_ROOT_FIELD(data: string, op: ActionOperator, value: Primitive, isPointer: boolean): Dictionary {
        const timestamp = Date.now();
        const operator = (op == '=') ? '' : op;
        const path = `${data}${operator}`;
        return {
            className: 'SetRootFieldAction',
            type: 'SET_ROOT_FIELD',
            id: `Action_${timestamp}_${U.getRandomString(5)}`,
            timestamp: timestamp,
            sender: 'Pointer_User_Default',
            hasFired: 0,
            path: path,
            pathArray: path.split('.'),
            field: path,
            value: value,
            isPointer: isPointer
        };
    }
}

export default Action;
