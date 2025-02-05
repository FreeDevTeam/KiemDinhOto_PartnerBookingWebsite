const initialState = {
  metaData : undefined
};
export default function commonReducer(state = initialState, action) {
  switch (action.type) {
    case "META_DATA":
      return {
        ...state,
        metaData: action.data,
      };
    default:
      return state;
  }
}
