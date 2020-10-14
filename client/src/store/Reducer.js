const Reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_SONGS': {
            return {
                ...state,
                songs: action.payload
            }
        }
        default: {
            return state;
        }
    }
}

export default Reducer;