import { useSelector } from "react-redux";

export default function useCommonData() {
  const metaData = useSelector(state => state.common.metaData);

  return {metaData}
}