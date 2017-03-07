export const STATUS_UPDATE;

export const statusUpdate = function (status) {
    return {
        type: STATUS_UPDATE,
        status
    }
}