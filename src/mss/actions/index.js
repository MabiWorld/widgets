import { createActions } from 'redux-actions';

const actions = createActions({
    APP: {
        STATUS: {
            UPDATE: status => ({ status: status })
        }
    }
});

export default actions;